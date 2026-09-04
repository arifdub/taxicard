-- =====================================================================
-- Fall back to the main phone number for WhatsApp.
-- Most drivers use WhatsApp on the number they already gave us, and a
-- blank field was hiding the button entirely.
-- The allow_whatsapp setting is still respected.
-- Run after 0001_init.sql.
-- =====================================================================

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
    'whatsapp_phone',  case
                         when s.allow_whatsapp
                         then coalesce(p.whatsapp_phone, p.phone)
                       end,
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

grant execute on function public.get_driver_card(citext) to anon, authenticated;
