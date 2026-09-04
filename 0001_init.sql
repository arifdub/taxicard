-- =====================================================================
-- Digital Taxi Business Card — initial schema
-- Target: Supabase (PostgreSQL 15+)
-- Tenant key: profiles.id == auth.users.id == bookings.driver_id
-- =====================================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ---------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------

-- ACCEPTED is kept for compatibility with the spec but the MVP flow is
-- PENDING -> CONFIRMED -> COMPLETED. See ARCHITECTURE.md.
create type booking_status as enum (
  'PENDING','ACCEPTED','DECLINED','CONFIRMED','COMPLETED','CANCELLED'
);

create type booking_type as enum ('NOW','LATER');

create type plan_tier as enum ('FREE','PRO','BUSINESS');

create type notification_type as enum (
  'NEW_BOOKING','BOOKING_CANCELLED','SYSTEM'
);

-- ---------------------------------------------------------------------
-- 2. Helper functions
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Normalises a phone number into a comparison key.
-- "+353 87 123 4567", "00353871234567" and "087 123 4567" all collapse
-- to "0871234567". Default country is Ireland; change the regex below
-- if you launch elsewhere.
create or replace function public.phone_key(p text)
returns text language sql immutable as $$
  select case
    when p is null or btrim(p) = '' then null
    else regexp_replace(
           regexp_replace(
             regexp_replace(btrim(p), '^\+', '00'),
           '\D', '', 'g'),
         '^(00353|353)', '0')
  end;
$$;

-- NOTE: is_admin() is defined in section 4, after the profiles table.
-- Postgres validates SQL function bodies at creation time, so a function
-- that reads profiles cannot be created before profiles exists.

-- ---------------------------------------------------------------------
-- 3. Reserved slugs
-- ---------------------------------------------------------------------

create table public.reserved_slugs (
  slug citext primary key
);

insert into public.reserved_slugs (slug) values
  ('admin'),('api'),('auth'),('login'),('logout'),('signup'),('register'),
  ('dashboard'),('bookings'),('customers'),('settings'),('card'),('b'),
  ('driver'),('drivers'),('app'),('www'),('help'),('support'),('terms'),
  ('privacy'),('pricing'),('about'),('contact'),('static'),('assets'),
  ('_next'),('favicon.ico'),('robots.txt'),('sitemap.xml');

-- ---------------------------------------------------------------------
-- 4. profiles  (one row per driver, PK == auth.users.id)
-- ---------------------------------------------------------------------

create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  slug                citext not null unique,
  name                text not null,
  business_name       text,
  email               citext,
  phone               text,
  whatsapp_phone      text,
  photo_url           text,
  vehicle_make        text,
  vehicle_model       text,
  vehicle_registration text,
  licence_number      text,
  description         text,
  service_area        text,
  is_available        boolean   not null default true,   -- green / red toggle
  is_active           boolean   not null default true,   -- admin kill switch
  is_admin            boolean   not null default false,
  plan                plan_tier not null default 'FREE', -- billing comes later
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint slug_format check (
    slug::text ~ '^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$'
  )
);

-- Reserved slugs are enforced by trigger, not CHECK: a CHECK constraint
-- cannot contain a subquery.
create or replace function public.check_slug_allowed()
returns trigger language plpgsql as $$
begin
  if exists (select 1 from public.reserved_slugs r where r.slug = new.slug) then
    raise exception 'slug_reserved' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger trg_profiles_slug_allowed
  before insert or update of slug on public.profiles
  for each row execute function public.check_slug_allowed();

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- SECURITY DEFINER so it can read profiles without re-entering RLS.
-- A plain subquery inside a policy on profiles would recurse forever.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------
-- 5. driver_settings  (1:1 with profiles)
-- ---------------------------------------------------------------------

create table public.driver_settings (
  driver_id            uuid primary key references public.profiles(id) on delete cascade,
  logo_url             text,
  primary_color        text not null default '#111827',
  welcome_message      text,
  allow_whatsapp       boolean not null default true,
  allow_phone_booking  boolean not null default true,
  allow_now_booking    boolean not null default true,
  allow_future_booking boolean not null default true,
  require_destination  boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint primary_color_hex check (primary_color ~ '^#[0-9a-fA-F]{6}$')
);

create trigger trg_driver_settings_updated_at
  before update on public.driver_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 6. customers  (private to one driver)
-- ---------------------------------------------------------------------

create table public.customers (
  id                uuid primary key default gen_random_uuid(),
  driver_id         uuid not null references public.profiles(id) on delete cascade,
  name              text not null,
  phone             text not null,
  phone_key         text generated always as (public.phone_key(phone)) stored,
  email             citext,
  notes             text,          -- private driver notes
  favourite_pickup  text,
  bookings_count    integer not null default 0,
  last_booking_at   timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- This is what makes "recognise the returning customer" correct rather
-- than best-effort: duplicates are impossible per driver.
create unique index customers_driver_phone_uniq
  on public.customers (driver_id, phone_key);
create index customers_driver_id_idx on public.customers (driver_id);
create index customers_driver_name_idx on public.customers (driver_id, lower(name));

create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 7. bookings
-- ---------------------------------------------------------------------

create table public.bookings (
  id                   uuid primary key default gen_random_uuid(),
  driver_id            uuid not null references public.profiles(id) on delete cascade,
  customer_id          uuid not null references public.customers(id) on delete cascade,
  public_token         uuid not null default gen_random_uuid(),  -- customer status link
  pickup_address       text not null,
  pickup_lat           double precision,
  pickup_lng           double precision,
  destination_address  text,
  destination_lat      double precision,
  destination_lng      double precision,
  booking_type         booking_type   not null default 'NOW',
  scheduled_at         timestamptz,   -- required when type = LATER
  status               booking_status not null default 'PENDING',
  customer_notes       text,
  driver_notes         text,
  source               text not null default 'PUBLIC_CARD',  -- or DRIVER_DASHBOARD
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint scheduled_required_for_later check (
    booking_type = 'NOW' or scheduled_at is not null
  )
);

create unique index bookings_public_token_uniq on public.bookings (public_token);
create index bookings_driver_scheduled_idx on public.bookings (driver_id, scheduled_at desc);
create index bookings_driver_status_idx    on public.bookings (driver_id, status);
create index bookings_driver_created_idx   on public.bookings (driver_id, created_at desc);
create index bookings_customer_idx         on public.bookings (customer_id, created_at desc);

create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- Cross-tenant integrity: a booking's customer must belong to the same
-- driver. Cheap insurance against an app-layer bug leaking data.
create or replace function public.check_booking_tenant()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1 from public.customers c
    where c.id = new.customer_id and c.driver_id = new.driver_id
  ) then
    raise exception 'customer_driver_mismatch' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger trg_bookings_tenant
  before insert or update of customer_id, driver_id on public.bookings
  for each row execute function public.check_booking_tenant();

-- ---------------------------------------------------------------------
-- 8. notifications
-- ---------------------------------------------------------------------

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  driver_id  uuid not null references public.profiles(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  type       notification_type not null default 'NEW_BOOKING',
  title      text not null,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_driver_unread_idx
  on public.notifications (driver_id, read, created_at desc);

-- Fire a notification whenever a booking lands, from any source.
create or replace function public.notify_new_booking()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_customer_name text;
begin
  select c.name into v_customer_name from public.customers c where c.id = new.customer_id;

  insert into public.notifications (driver_id, booking_id, type, title, message)
  values (
    new.driver_id,
    new.id,
    'NEW_BOOKING',
    'New booking request',
    coalesce(v_customer_name,'A customer') || ' — ' || new.pickup_address ||
      coalesce(' → ' || new.destination_address, '')
  );
  return new;
end;
$$;

create trigger trg_bookings_notify
  after insert on public.bookings
  for each row when (new.status = 'PENDING')
  execute function public.notify_new_booking();

-- Keep customer rollups in sync.
create or replace function public.touch_customer_stats()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.customers
     set bookings_count  = bookings_count + 1,
         last_booking_at = new.created_at
   where id = new.customer_id;
  return new;
end;
$$;

create trigger trg_bookings_customer_stats
  after insert on public.bookings
  for each row execute function public.touch_customer_stats();

-- ---------------------------------------------------------------------
-- 9. New-user bootstrap
-- ---------------------------------------------------------------------

create or replace function public.generate_unique_slug(p_base text)
returns citext language plpgsql security definer set search_path = public as $$
declare
  v_base text;
  v_slug text;
  i int := 0;
begin
  v_base := lower(regexp_replace(coalesce(p_base,'driver'), '[^a-zA-Z0-9]+', '-', 'g'));
  v_base := btrim(v_base, '-');
  if length(v_base) < 3 then v_base := 'driver-' || v_base; end if;
  v_base := left(v_base, 24);
  v_slug := v_base;

  while exists (select 1 from public.profiles p where p.slug = v_slug)
     or exists (select 1 from public.reserved_slugs r where r.slug = v_slug) loop
    i := i + 1;
    v_slug := v_base || '-' || i::text;
  end loop;

  return v_slug;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_name text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

  insert into public.profiles (id, slug, name, email)
  values (new.id, public.generate_unique_slug(v_name), v_name, new.email);

  insert into public.driver_settings (driver_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 10. Row Level Security
-- ---------------------------------------------------------------------

alter table public.profiles        enable row level security;
alter table public.driver_settings enable row level security;
alter table public.customers       enable row level security;
alter table public.bookings        enable row level security;
alter table public.notifications   enable row level security;
alter table public.reserved_slugs  enable row level security;

-- Nothing is readable by anonymous visitors through the tables.
-- The public card and booking flow go through SECURITY DEFINER RPCs only.
revoke all on public.customers     from anon;
revoke all on public.bookings      from anon;
revoke all on public.notifications from anon;
revoke all on public.profiles      from anon;
revoke all on public.driver_settings from anon;

-- profiles ------------------------------------------------------------
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy profiles_admin_insert on public.profiles
  for insert to authenticated with check (public.is_admin());

create policy profiles_admin_delete on public.profiles
  for delete to authenticated using (public.is_admin());

-- A driver must not be able to promote themselves to admin, flip their
-- own is_active, or change their plan. Enforce at trigger level.
create or replace function public.guard_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    return new;
  end if;
  new.is_admin  := old.is_admin;
  new.is_active := old.is_active;
  new.plan      := old.plan;
  return new;
end;
$$;

create trigger trg_profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();

-- driver_settings -----------------------------------------------------
create policy settings_all_own on public.driver_settings
  for all to authenticated
  using (driver_id = auth.uid() or public.is_admin())
  with check (driver_id = auth.uid() or public.is_admin());

-- customers -----------------------------------------------------------
create policy customers_all_own on public.customers
  for all to authenticated
  using (driver_id = auth.uid() or public.is_admin())
  with check (driver_id = auth.uid() or public.is_admin());

-- bookings ------------------------------------------------------------
create policy bookings_all_own on public.bookings
  for all to authenticated
  using (driver_id = auth.uid() or public.is_admin())
  with check (driver_id = auth.uid() or public.is_admin());

-- notifications -------------------------------------------------------
create policy notifications_select_own on public.notifications
  for select to authenticated
  using (driver_id = auth.uid() or public.is_admin());

create policy notifications_update_own on public.notifications
  for update to authenticated
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());

-- reserved_slugs ------------------------------------------------------
create policy reserved_slugs_read on public.reserved_slugs
  for select to authenticated, anon using (true);

-- ---------------------------------------------------------------------
-- 11. Public RPCs (the only anon surface)
-- ---------------------------------------------------------------------

-- 11a. Digital business card. Returns only card-safe columns — never
-- email, licence number, customers or bookings.
create or replace function public.get_driver_card(p_slug citext)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'slug',            p.slug,
    'name',            p.name,
    'business_name',   p.business_name,
    'photo_url',       p.photo_url,
    'description',     p.description,
    'service_area',    p.service_area,
    'phone',           p.phone,
    'whatsapp_phone',  case when s.allow_whatsapp then p.whatsapp_phone end,
    'vehicle',         nullif(btrim(concat_ws(' ', p.vehicle_make, p.vehicle_model)), ''),
    'is_available',    p.is_available,
    'logo_url',        s.logo_url,
    'primary_color',   s.primary_color,
    'welcome_message', s.welcome_message,
    'allow_now_booking',    s.allow_now_booking,
    'allow_future_booking', s.allow_future_booking,
    'require_destination',  s.require_destination
  )
  from public.profiles p
  join public.driver_settings s on s.driver_id = p.id
  where p.slug = p_slug and p.is_active;
$$;

-- 11b. Create a booking from the public card.
-- Upserts the customer by phone, inserts the booking, returns a token
-- the customer can poll for status. Atomic — no partial writes.
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
  p_destination_lng     double precision default null
)
returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare
  v_driver     public.profiles%rowtype;
  v_settings   public.driver_settings%rowtype;
  v_phone_key  text;
  v_customer_id uuid;
  v_booking    public.bookings%rowtype;
  v_recent     int;
begin
  -- validate input ----------------------------------------------------
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

  -- crude abuse brake: 5 pending bookings per phone per driver per hour
  select count(*) into v_recent
  from public.bookings b
  join public.customers c on c.id = b.customer_id
  where b.driver_id = v_driver.id
    and c.phone_key = v_phone_key
    and b.created_at > now() - interval '1 hour';

  if v_recent >= 5 then
    raise exception 'rate_limited' using errcode = '53400';
  end if;

  -- recognise or create the customer -----------------------------------
  insert into public.customers (driver_id, name, phone)
  values (v_driver.id, btrim(p_customer_name), btrim(p_customer_phone))
  on conflict (driver_id, phone_key) do update
    set name = case
                 when btrim(excluded.name) <> '' then excluded.name
                 else public.customers.name
               end
  returning id into v_customer_id;

  -- remember their usual pickup if we don't have one
  update public.customers
     set favourite_pickup = coalesce(favourite_pickup, btrim(p_pickup_address))
   where id = v_customer_id;

  -- create the booking --------------------------------------------------
  insert into public.bookings (
    driver_id, customer_id, pickup_address, pickup_lat, pickup_lng,
    destination_address, destination_lat, destination_lng,
    booking_type, scheduled_at, customer_notes, source
  ) values (
    v_driver.id, v_customer_id, btrim(p_pickup_address), p_pickup_lat, p_pickup_lng,
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

-- 11c. Customer-facing status check. Driver's phone is only revealed
-- once the booking is actually confirmed.
create or replace function public.get_booking_by_token(p_token uuid)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'status',              b.status,
    'pickup_address',      b.pickup_address,
    'destination_address', b.destination_address,
    'booking_type',        b.booking_type,
    'scheduled_at',        b.scheduled_at,
    'driver_name',         p.name,
    'business_name',       p.business_name,
    'driver_photo_url',    p.photo_url,
    'driver_phone',        case when b.status in ('CONFIRMED','ACCEPTED','COMPLETED')
                                then p.phone end
  )
  from public.bookings b
  join public.profiles p on p.id = b.driver_id
  where b.public_token = p_token;
$$;

-- 11d. Slug availability check for the signup / settings screens.
create or replace function public.is_slug_available(p_slug citext)
returns boolean
language sql stable security definer set search_path = public as $$
  select p_slug::text ~ '^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$'
     and not exists (select 1 from public.profiles p where p.slug = p_slug)
     and not exists (select 1 from public.reserved_slugs r where r.slug = p_slug);
$$;

-- Grants: anon may call these four functions and nothing else.
revoke all on function public.get_driver_card(citext)      from public;
revoke all on function public.get_booking_by_token(uuid)    from public;
revoke all on function public.is_slug_available(citext)     from public;
revoke all on function public.create_public_booking(
  citext, text, text, text, booking_type, text, timestamptz, text,
  double precision, double precision, double precision, double precision) from public;

grant execute on function public.get_driver_card(citext)     to anon, authenticated;
grant execute on function public.get_booking_by_token(uuid)   to anon, authenticated;
grant execute on function public.is_slug_available(citext)    to anon, authenticated;
grant execute on function public.create_public_booking(
  citext, text, text, text, booking_type, text, timestamptz, text,
  double precision, double precision, double precision, double precision) to anon, authenticated;
