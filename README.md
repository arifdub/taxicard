# TaxiCard — stage 1

Driver signup, login, password reset, and profile editing with a unique
booking link. No maps, no WhatsApp API, no verification gate yet.

## Setup without a terminal

1. **Supabase.** Create a project. In SQL Editor, paste and run the whole
   of `0001_init.sql`. Under Authentication → Sign In / Providers → Email,
   turn OFF "Confirm email" while testing.

2. **GitHub.** Upload every file and folder from this bundle to your repo,
   keeping the folder structure. Do NOT upload `.env.local` if you create
   one — keys belong in Vercel, not in the repo.

3. **Vercel.** Import the repo. Before the first deploy, add three
   environment variables:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | From Supabase → Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The `anon public` key |
   | `NEXT_PUBLIC_SITE_URL` | Your Vercel URL, e.g. `https://taxicard.vercel.app` |

   Vercel runs the install and build itself. There is nothing to run
   locally.

4. Open your Vercel URL, sign up, and fill in your profile.

## Test checklist

1. Sign up. You land on Settings with a welcome heading.
2. The row exists in Supabase → Table Editor → profiles, with a slug.
3. Change the slug to `john`. It shows "Available".
4. Try `admin` — it should say reserved.
5. Save with the phone number empty — it refuses.
6. Save properly, reload, values persist.
7. Log out, log in again, you land on the dashboard.
8. Open `/dashboard` in a private window — it redirects to `/login`.

### The isolation test that matters

9. Sign up a second driver in a different browser.
10. Give her the slug `mary`. It saves. Try `john` — refused as taken.
11. In Supabase → Table Editor, confirm two rows exist in `profiles`.
12. Signed in as Mary in the app, nothing anywhere should show John's
    details. If it does, RLS is not working and no other stage is safe.

## Known gaps, deliberately

- No profile photo upload. Stage 2, with the card preview.
- No availability toggle in the UI. The column exists.
- The dashboard is a placeholder until stage 5.
- Changing a slug breaks printed QR codes. Needs a warning, or old-slug
  redirects, before drivers print anything.

## Next

Stage 2: card preview, photo upload, QR generation and download.
