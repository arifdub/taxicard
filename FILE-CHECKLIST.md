# Upload checklist

Tick each one off in GitHub after uploading. A single missing file breaks
the whole build — `layout.tsx` in particular.

## Root of the repo (9 items)

- [ ] `src/` folder
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `next.config.ts`
- [ ] `postcss.config.mjs`
- [ ] `.gitignore`
- [ ] `README.md`
- [ ] `FILE-CHECKLIST.md`
- [ ] the seven `.sql` files

## src/app — the ones that break everything if missing

- [ ] `layout.tsx`      ← without this, nothing builds at all
- [ ] `globals.css`
- [ ] `page.tsx`
- [ ] `manifest.ts`
- [ ] `icon.tsx`
- [ ] `apple-icon.tsx`

## src/app — folders

- [ ] `[slug]/` with `page.tsx`, `not-found.tsx`, `book/`
- [ ] `b/[token]/`
- [ ] `dashboard/` with `layout.tsx`, `page.tsx`, `nav-menu.tsx`,
      `push-setup.tsx`, `install-prompt.tsx` and the folders
      `bookings/ card/ customers/ settings/`
- [ ] `admin/`
- [ ] `auth/`
- [ ] `api/geocode/reverse/` and `api/push/subscribe/`
- [ ] `login/  signup/  reset-password/`
- [ ] `icon-192.png/  icon-512.png/  icon-maskable.png/  sw.js/`
      (yes, these are folders with a `route.tsx` inside)

## src/components (6 files)

- [ ] `booking-card.tsx  driver-card.tsx  incoming-booking.tsx`
- [ ] `reveal.tsx  ui.tsx  wordmark.tsx`

## src/lib (12 files)

- [ ] `admin.ts  bookings.ts  brand.ts  icon-art.tsx  phone.ts`
- [ ] `push.ts  site.ts  validation/schemas.ts`
- [ ] `supabase/admin.ts  client.ts  middleware.ts  server.ts`

## src (1 file)

- [ ] `middleware.ts`  ← directly inside `src`, not inside `src/app`

**Total: 80 files.**

## Why files go missing

Folders whose names start with `.` or `[` and folders that look like
files (`icon-192.png`, `sw.js`) are the usual casualties — some unzip
tools and uploaders skip or mangle them. After uploading, spot-check
`src/app/layout.tsx` and `src/app/icon-192.png/route.tsx` in GitHub. If
those two are there, the rest almost certainly is too.
