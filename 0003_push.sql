-- =====================================================================
-- Web push subscriptions. Run after 0001_init.sql.
-- =====================================================================

create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  driver_id  uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

-- One row per device. Re-subscribing on the same phone replaces it
-- rather than piling up duplicates that all fire at once.
create unique index if not exists push_subscriptions_endpoint_uniq
  on public.push_subscriptions (endpoint);
create index if not exists push_subscriptions_driver_idx
  on public.push_subscriptions (driver_id);

alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon;

create policy push_subs_own on public.push_subscriptions
  for all to authenticated
  using (driver_id = auth.uid())
  with check (driver_id = auth.uid());
