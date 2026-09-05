# TaxiCard

A digital taxi card and private booking system for independent drivers.
Each driver gets a public card at `/{slug}`, a QR code, their own customer
list, and a dashboard. No marketplace, no dispatch.

## Upload

Upload everything in this folder to GitHub, keeping the structure. There
is no `public` folder — icons, the manifest and the service worker are all
generated from code in `src/app`, so nothing binary needs uploading.

## SQL — run in the Supabase SQL editor, in order

| File | What it does | Needed |
|---|---|---|
| `0001_init.sql` | Tables, RLS, booking functions | Yes |
| `0002_storage.sql` | `driver-media` bucket for photos | Yes |
| `0003_push.sql` | Push subscriptions | For notifications |
| `0004_card_whatsapp_fallback.sql` | WhatsApp falls back to main number | Yes |
| `0005_make_admin.sql` | Makes you an admin (edit the email first) | Optional |
| `0006_realtime.sql` | Live ringing alert | Optional |
| `0007_eircode.sql` | Eircode + pickup coordinates | Yes |

Safe to re-run. "Already exists" errors mean it ran before.

## Environment variables in Vercel (Production)

```
NEXT_PUBLIC_SUPABASE_URL        https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   sb_publishable_…
NEXT_PUBLIC_SITE_URL            https://taxicard.ie      (no trailing slash)
SUPABASE_SERVICE_ROLE_KEY       sb_secret_…              (sensitive)
NEXT_PUBLIC_VAPID_PUBLIC_KEY    B…
VAPID_PRIVATE_KEY               …                        (sensitive)
PUSH_CONTACT_EMAIL              you@example.com
GOOGLE_MAPS_SERVER_KEY          optional, names streets for "use my location"
```

Variables only apply to new builds. After editing one, redeploy.

## What is built

**Driver**: signup, login, password reset, profile with a unique link,
card preview, photo upload, QR download, availability toggle, dashboard
with live counts, accept and decline, bookings list, customer list with
call and WhatsApp, search, manual add, private notes, booking history.

**Passenger**: public card at `/{slug}` with call, WhatsApp and book.
Booking form with "use my current location" and optional Eircode. A status
page at `/b/{token}` that updates itself.

**Alerts**: web push once installed to the home screen, plus a full-screen
ringing alert when a booking arrives with the app open.

**Admin** at `/admin`: platform counts, driver list, disable and re-enable,
plan flags. Deliberately shows counts, not other drivers' customers.

## Known gaps

- No driver licence verification. Anyone can sign up.
- No email alerts. Push only.
- No address autocomplete. Typed addresses plus optional Eircode.
- Changing a slug breaks printed QR codes. No warning yet.
- GDPR: privacy policy and a customer data deletion route still to do.
