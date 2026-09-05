-- =====================================================================
-- Let the driver's open app hear about new bookings instantly.
-- Realtime still honours RLS, so a driver only ever receives events for
-- their own rows. Run after 0001_init.sql.
-- =====================================================================

alter publication supabase_realtime add table public.bookings;

-- If that errors with "relation is already member of publication",
-- it is already enabled and there is nothing to do.
