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

## Stage 4 — booking form and confirmation

New pages, all public:

- `/{slug}/book` — the booking form
- `/b/{token}` — the passenger's status page

Nothing here touches tables directly. Everything goes through the
`create_public_booking` and `get_booking_by_token` functions, so an
anonymous visitor still has no read or write access to any table.

Test:

1. Log out, or use a private window.
2. Open your card, tap Book my taxi, fill it in, send.
3. You land on `/b/<token>` showing Pending.
4. In Supabase, Table Editor -> bookings: one row, status PENDING.
5. Table Editor -> customers: one row, with your phone in `phone_key`
   stripped of spaces.
6. Book again with the SAME phone number. Two bookings, still ONE
   customer. That is the repeat-customer rule working.
7. Book again with the same number but a different spelling, e.g.
   `+353 87 123 4567` instead of `087 123 4567`. Still one customer.
8. In Supabase, edit that booking's status to CONFIRMED by hand. Within
   about six seconds the passenger page flips to confirmed and shows the
   driver's phone number.
9. Turn your availability off, then open `/{slug}/book`. It refuses
   politely and still offers the call button.

## Known gaps, deliberately

- The driver cannot accept or decline in the app yet. Stage 5. Until
  then, change the status by hand in Supabase to test.
- The status page polls every six seconds rather than using realtime.
  Anonymous visitors have no read access to `bookings`, and realtime
  honours that, so polling is the honest way to do it without weakening
  the security model.
- No map or geocoding. Addresses are typed text.
- No email or WhatsApp alerts yet. Stage 6.
- Changing a slug breaks printed QR codes. Needs a warning, or old-slug
  redirects, before drivers print anything.

## Next

Stage 5: the driver dashboard — today's bookings, accept and decline.
