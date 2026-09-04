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

## Stage 2 and 3 — my card, QR, public card

Before these work, run `0002_storage.sql` in the Supabase SQL editor.
It creates the `driver-media` bucket for profile photos. If it errors with
"must be owner of table objects", create the bucket by hand instead:
Storage -> New bucket -> name `driver-media` -> tick Public.

New pages:

- `/dashboard/card` — preview, availability switch, QR download, photo upload
- `/{slug}` — the public card, readable with no login at all

Test:

1. Open `/dashboard/card`. Your QR and link appear.
2. Download the PNG and scan it with your phone camera.
3. It opens your public card. **Log out first, or use a private window** —
   that is the only way to prove a stranger can see it.
4. Flip the availability switch. Reload the public card: the badge changes
   and the call button stays.
5. Upload a photo. It appears on both the preview and the public card.
6. Visit `/nonsense`. You get the "No driver here" page, not a crash.

## Known gaps, deliberately

- No "Book my taxi" button yet. It is deliberately hidden until the
  booking form exists in stage 4 — a dead button on a card you might show
  a real customer is worse than no button.
- The dashboard is a placeholder until stage 5.
- Changing a slug breaks printed QR codes. Needs a warning, or old-slug
  redirects, before drivers print anything.

## Next

Stage 4: the booking form, and the customer's confirmation page.
