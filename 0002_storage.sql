-- =====================================================================
-- Storage for profile photos and logos
-- Run this AFTER 0001_init.sql.
-- If it errors with "must be owner of table objects", create the bucket
-- from the Supabase dashboard (Storage -> New bucket -> driver-media,
-- public) and add these four policies through the Storage UI instead.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('driver-media', 'driver-media', true)
on conflict (id) do nothing;

-- Files must live under a folder named for the driver's uuid:
--   driver-media/<auth.uid()>/photo.jpg
create policy driver_media_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'driver-media');

create policy driver_media_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'driver-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy driver_media_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'driver-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy driver_media_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'driver-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
