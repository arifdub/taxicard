-- =====================================================================
-- Make yourself a platform administrator.
-- Replace the email with the one you signed up with, then run.
-- =====================================================================

update public.profiles
   set is_admin = true
 where id = (select id from auth.users where email = 'YOUR@EMAIL.COM');

-- Check it worked:
-- select name, email, is_admin from public.profiles where is_admin;
