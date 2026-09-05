-- =====================================================================
-- Eircode on bookings, plus coordinates from "use my current location".
-- Run after 0001_init.sql (and after 0004 if you ran it).
-- =====================================================================

alter table public.bookings
  add column if not exists pickup_eircode text;

-- Replacing the function signature, so drop the old one first. Without
-- this Postgres keeps both and calls become ambiguous.
drop function if exists public.create_public_booking(
  citext, text, text, text, booking_type, text, timestamptz, text,
  double precision, double precision, double precision, double precision);

create or replace function public.create_public_booking(
  p_slug                citext,
  p_customer_name       text,
  p_customer_phone      text,
  p_pickup_address      text,
  p_booking_type        booking_type default 'NOW',
  p_destination_address text default null,
  p_scheduled_at        timestamptz default null,
  p_customer_notes      text default null,
  p_pickup_lat          double precision default null,
  p_pickup_lng          double precision default null,
  p_destination_lat     double precision default null,
  p_destination_lng     double precision default null,
  p_pickup_eircode      text default null
)
returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_driver      public.profiles%rowtype;
  v_settings    public.driver_settings%rowtype;
  v_phone_key   text;
  v_customer_id uuid;
  v_booking     public.bookings%rowtype;
  v_recent      int;
  v_eircode     text;
begin
  if btrim(coalesce(p_customer_name,'')) = '' then
    raise exception 'name_required' using errcode = '22023';
  end if;

  v_phone_key := public.phone_key(p_customer_phone);
  if v_phone_key is null or length(v_phone_key) < 7 then
    raise exception 'invalid_phone' using errcode = '22023';
  end if;

  if btrim(coalesce(p_pickup_address,'')) = '' then
    raise exception 'pickup_required' using errcode = '22023';
  end if;

  -- Store Eircodes in one shape: uppercase, single space, e.g. D15 XY12.
  v_eircode := upper(regexp_replace(coalesce(p_pickup_eircode,''), '\s', '', 'g'));
  if v_eircode = '' then
    v_eircode := null;
  elsif v_eircode !~ '^([AC-FHKNPRTV-Y][0-9]{2}|D6W)[0-9AC-FHKNPRTV-Y]{4}$' then
    raise exception 'invalid_eircode' using errcode = '22023';
  else
    v_eircode := left(v_eircode, 3) || ' ' || right(v_eircode, 4);
  end if;

  select * into v_driver from public.profiles where slug = p_slug and is_active;
  if not found then
    raise exception 'driver_not_found' using errcode = 'P0002';
  end if;

  if not v_driver.is_available then
    raise exception 'driver_unavailable' using errcode = '22023';
  end if;

  select * into v_settings from public.driver_settings where driver_id = v_driver.id;

  if p_booking_type = 'NOW' and not v_settings.allow_now_booking then
    raise exception 'now_booking_disabled' using errcode = '22023';
  end if;

  if p_booking_type = 'LATER' then
    if not v_settings.allow_future_booking then
      raise exception 'future_booking_disabled' using errcode = '22023';
    end if;
    if p_scheduled_at is null or p_scheduled_at < now() - interval '5 minutes' then
      raise exception 'invalid_scheduled_at' using errcode = '22023';
    end if;
    if p_scheduled_at > now() + interval '180 days' then
      raise exception 'scheduled_too_far' using errcode = '22023';
    end if;
  end if;

  if v_settings.require_destination
     and btrim(coalesce(p_destination_address,'')) = '' then
    raise exception 'destination_required' using errcode = '22023';
  end if;

  select count(*) into v_recent
  from public.bookings b
  join public.customers c on c.id = b.customer_id
  where b.driver_id = v_driver.id
    and c.phone_key = v_phone_key
    and b.created_at > now() - interval '1 hour';

  if v_recent >= 5 then
    raise exception 'rate_limited' using errcode = '53400';
  end if;

  insert into public.customers (driver_id, name, phone)
  values (v_driver.id, btrim(p_customer_name), btrim(p_customer_phone))
  on conflict (driver_id, phone_key) do update
    set name = case
                 when btrim(excluded.name) <> '' then excluded.name
                 else public.customers.name
               end
  returning id into v_customer_id;

  update public.customers
     set favourite_pickup = coalesce(favourite_pickup, btrim(p_pickup_address))
   where id = v_customer_id;

  insert into public.bookings (
    driver_id, customer_id, pickup_address, pickup_eircode,
    pickup_lat, pickup_lng,
    destination_address, destination_lat, destination_lng,
    booking_type, scheduled_at, customer_notes, source
  ) values (
    v_driver.id, v_customer_id, btrim(p_pickup_address), v_eircode,
    p_pickup_lat, p_pickup_lng,
    nullif(btrim(coalesce(p_destination_address,'')), ''), p_destination_lat, p_destination_lng,
    p_booking_type,
    case when p_booking_type = 'LATER' then p_scheduled_at else now() end,
    nullif(btrim(coalesce(p_customer_notes,'')), ''),
    'PUBLIC_CARD'
  )
  returning * into v_booking;

  return jsonb_build_object(
    'booking_token', v_booking.public_token,
    'status',        v_booking.status,
    'driver_name',   v_driver.name
  );
end;
$$;

revoke all on function public.create_public_booking(
  citext, text, text, text, booking_type, text, timestamptz, text,
  double precision, double precision, double precision, double precision, text) from public;

grant execute on function public.create_public_booking(
  citext, text, text, text, booking_type, text, timestamptz, text,
  double precision, double precision, double precision, double precision, text)
  to anon, authenticated;
