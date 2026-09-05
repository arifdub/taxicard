import Link from 'next/link'
import QRCode from 'qrcode'
import type { Metadata } from 'next'
import { siteUrl } from '@/lib/site'
import Wordmark from '@/components/wordmark'
import Reveal from '@/components/reveal'
import { LOGO_FULL } from '@/lib/brand'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'TaxiCard — your own digital taxi card and booking page',
  description:
    'Independent taxi drivers in Ireland: give your regular customers a QR code they can scan to book you directly. Your customers, your business, no marketplace.',
}

export default async function Home() {
  // A real, scannable code on the sample card — it opens this site.
  const sampleQr = await QRCode.toString(siteUrl(), {
    type: 'svg',
    margin: 0,
    color: { dark: '#0F1B33', light: '#FFFFFF' },
  })

  return (
    <div className="tc-dark-page text-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4">
        <Wordmark size="md" />
        <Link
          href="/login"
          className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
        >
          Driver log in
        </Link>
      </nav>

      <header className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:pb-24 md:pt-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_FULL}
          alt="TaxiCard — tap, book, ride"
          className="tc-in mb-6 h-auto w-52 md:w-64"
        />

        <p className="tc-left text-sm font-semibold uppercase tracking-wide text-yellow">
          For independent taxi drivers
        </p>
        <h1 className="tc-left tc-d1 mt-3 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
          Create a beautiful digital card for your passengers, and build your own customer list.
        </h1>
        <p className="tc-left tc-d2 mt-5 max-w-xl text-base text-slate-300 md:text-lg">
          A digital taxi card with a proper booking system behind it. Your
          passengers can call you, message you on WhatsApp, or book you in a
          few taps. Everyone who books becomes yours, on your own customer
          list, and nobody else can see it.
        </p>

        <div className="tc-in tc-d3 mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-2xl bg-yellow px-7 py-4 text-center text-base font-semibold text-navy shadow-[0_14px_34px_-14px_rgba(255,199,44,0.95)] transition active:scale-[0.99]"
          >
            Create your taxi card — free
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border border-brandblue/50 bg-brandblue/10 px-7 py-4 text-center text-base font-semibold text-white transition active:scale-[0.99]"
          >
            Driver log in
          </Link>
        </div>

        <p className="tc-in tc-d4 mt-4 text-sm text-slate-400">
          No commission. No app for your passengers to download.
        </p>
      </header>

      <section className="tc-band py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-5 md:grid-cols-2">
          <Reveal from="right" className="flex justify-center">
            <PhoneMock qr={sampleQr} />
          </Reveal>

          <Reveal from="left" delay={80}>
            <p className="text-sm font-semibold uppercase tracking-wide text-yellow">
              What your customer sees
            </p>
            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">
              One page. Nothing to install.
            </h2>
            <p className="mt-4 text-slate-300">
              They scan the code on your business card and this opens in their
              browser. Your photo, so they know it is you. Your name and the
              areas you cover. Then three things they can do, and nothing else
              to get lost in.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="mt-0.5 font-semibold text-yellow">Book</span>
                <span>
                  Pickup, destination, now or later, name and number. Four
                  fields, one screen.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 font-semibold text-yellow">Call</span>
                <span>
                  Rings your phone directly. Always there, even when you have
                  marked yourself unavailable.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 font-semibold text-yellow">Message</span>
                <span>
                  Opens WhatsApp with you already in the chat. Good for
                  regulars who would rather type than talk.
                </span>
              </li>
            </ul>

            <p className="mt-6 text-sm text-slate-400">
              And the code at the bottom is theirs to pass on. That is how a
              good driver gets the next customer.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-yellow">
              Three steps
            </p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              From nothing to taking bookings in an evening.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Reveal from="left">
              <Step
                n="1"
                icon={<IdIcon />}
                title="Set up your card"
                body="Your name, photo, phone, vehicle and service area. Takes a few minutes and you choose your own link, like taxicard.ie/john."
              />
            </Reveal>
            <Reveal delay={90}>
              <Step
                n="2"
                icon={<PrinterIcon />}
                title="Print your QR code"
                body="Download it and put it on business cards, in the back of the car, on a flyer. One scan opens your page. Nothing to install."
              />
            </Reveal>
            <Reveal from="right" delay={180}>
              <Step
                n="3"
                icon={<BellIcon />}
                title="Take bookings directly"
                body="A request arrives with pickup, destination and time. You accept or decline. The customer sees the confirmation and your number."
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="tc-band py-16">
        <div className="mx-auto max-w-5xl px-5">
          <Reveal className="text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">
              This is not another taxi app
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-300">
              There is no pool of drivers and no matching. A customer who opens
              your card books you, or nobody. The work you have built up stays
              yours.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <Reveal from="left">
              <Point
                icon={<UsersIcon />}
                title="Your own customer list"
                body="Every booking builds it. Sarah books you once and you have her number, her usual pickup and her history — recognised automatically the next time, even if she writes her number differently."
              />
            </Reveal>
            <Reveal from="right" delay={90}>
              <Point
                icon={<LockIcon />}
                title="Nobody else can see it"
                body="Every driver's customers and bookings are walled off at database level, not just hidden in the app. Another driver on TaxiCard cannot reach your list."
              />
            </Reveal>
            <Reveal from="left" delay={60}>
              <Point
                icon={<TapIcon />}
                title="Easy for older customers"
                body="Big buttons, no login, no download. If they can open a web page, they can book you. And the call button never goes away."
              />
            </Reveal>
            <Reveal from="right" delay={150}>
              <Point
                icon={<SwitchIcon />}
                title="You stay in control"
                body="Mark yourself unavailable and your card says so, while still letting people ring you. Accept or decline every job yourself."
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5">
          <Reveal>
            <h2 className="text-center text-2xl font-semibold md:text-3xl">
              Common questions
            </h2>
          </Reveal>
          <div className="mx-auto mt-10 max-w-3xl space-y-5">
            <Faq
              q="Do my customers need an app?"
              a="No. They scan your QR code or tap your link and the booking page opens in their phone browser. They can add it to their home screen if they want it handy."
            />
            <Faq
              q="What does it cost?"
              a="Nothing while we are building it out. There is no commission on fares and there never will be — the fare is between you and your passenger."
            />
            <Faq
              q="Do I need to be a licensed driver?"
              a="TaxiCard is for drivers who already hold an SPSV licence. It is a booking page for the customers you already have, not a way to find new fares."
            />
            <Faq
              q="What happens to my customers' details?"
              a="They are stored against your account and only you can see them. You can delete a customer at any time."
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Set up your card today
          </h2>
          <p className="mt-3 text-slate-300">
            A few minutes now, and your next regular can book you with two taps.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-2xl bg-yellow px-8 py-4 text-base font-semibold text-navy shadow-[0_14px_34px_-14px_rgba(255,199,44,0.95)]"
          >
            Create your taxi card
          </Link>
          <p className="mt-5 text-sm text-slate-400">
            Already signed up?{' '}
            <Link href="/login" className="font-semibold text-brandblue">
              Log in here
            </Link>
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 text-sm text-slate-400">
          <span className="inline-flex items-center gap-2">
            <Wordmark size="sm" />
            <span className="hidden sm:inline">— built for independent drivers in Ireland.</span>
          </span>
          <Link href="/login" className="text-brandblue">
            Driver log in
          </Link>
        </div>
      </footer>
    </div>
  )
}

function Step({
  n,
  title,
  body,
  icon,
}: {
  n: string
  title: string
  body: string
  icon: ReactNode
}) {
  return (
    <div className="h-full rounded-2xl border border-white/10 bg-navy-soft p-6 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow text-navy">
        {icon}
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-yellow">
        Step {n}
      </p>
      <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{body}</p>
    </div>
  )
}

function Point({
  title,
  body,
  icon,
}: {
  title: string
  body: string
  icon: ReactNode
}) {
  return (
    <div className="flex h-full gap-4 rounded-2xl border border-white/10 bg-navy-soft p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow/15 text-yellow">
        {icon}
      </span>
      <div>
        <h3 className="text-lg font-semibold text-yellow">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{body}</p>
      </div>
    </div>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-white/10 pb-5">
      <h3 className="font-semibold">{q}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{a}</p>
    </div>
  )
}

function PhoneMock({ qr }: { qr: string }) {
  return (
    <div className="tc-in w-[292px] rounded-[44px] bg-[#050B16] p-2.5 shadow-[0_36px_80px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
      <div className="relative overflow-hidden rounded-[36px] bg-navy-soft">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#050B16]" />

        <div className="bg-navy px-5 pb-6 pt-9 text-center">
          <SampleAvatar />
          <p className="mt-2.5 text-lg font-semibold text-white">John Smith</p>
          <p className="text-[11px] text-slate-300">Your local taxi driver</p>
          <p className="text-[11px] text-slate-300">Dublin and surrounding areas</p>
          <span className="mt-3 inline-block rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-semibold text-white">
            Available for bookings
          </span>
        </div>

        <div className="space-y-2.5 px-4 py-4">
          <div className="rounded-xl bg-yellow py-3 text-center text-sm font-semibold text-navy">
            Book my taxi
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-[#1FA855] py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1.1 1A16 16 0 014 5.1 1 1 0 015 4z"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[10px] font-semibold text-white">Call John</span>
            </div>

            <div className="flex flex-col items-center gap-1 rounded-xl bg-[#25D366] py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/30 text-[#06301A]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.66-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.7.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.12-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 012.89 6.99c0 5.45-4.43 9.89-9.88 9.89M20.46 3.49A11.8 11.8 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 005.69 1.45h.005c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.42" />
                </svg>
              </span>
              <span className="text-[10px] font-semibold text-[#06301A]">
                WhatsApp
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Pass John on to a friend
            </p>
            <div
              className="mx-auto mt-2 w-20 rounded-lg bg-white p-1.5"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            <p className="mt-1.5 text-[10px] font-semibold text-white">
              taxicard.ie/john
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SampleAvatar() {
  return (
    <svg
      viewBox="0 0 96 96"
      className="mx-auto h-16 w-16"
      role="img"
      aria-label="Sample driver photo"
    >
      <circle cx="48" cy="48" r="48" fill="#FFC72C" />
      <circle cx="48" cy="38" r="15" fill="#0F1B33" />
      <path
        d="M18 92c3-16 15-25 30-25s27 9 30 25z"
        fill="#0F1B33"
      />
      <path
        d="M33 30a15 15 0 0130 0c0 2-2 3-5 2-6-2-14-2-20 1-3 1-5 0-5-3z"
        fill="#1B2A47"
      />
    </svg>
  )
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function IdIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <circle cx="8.5" cy="11" r="2.2" />
      <path d="M5 16.2a3.9 3.9 0 017 0M14.5 10h4M14.5 13.5h4" />
    </svg>
  )
}

function PrinterIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M7 8V3.5h10V8" />
      <rect x="3" y="8" width="18" height="8" rx="2" />
      <rect x="7" y="14" width="10" height="6.5" rx="1.2" />
      <path d="M17.5 11h.01" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M18 9a6 6 0 10-12 0c0 4.2-1.5 5.6-1.5 5.6h15S18 13.2 18 9z" />
      <path d="M10.2 18.5a2 2 0 003.6 0" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.2 19.5a5.9 5.9 0 0111.6 0" />
      <path d="M16 5.5a3.2 3.2 0 010 6M16.8 14.8a5.5 5.5 0 013.9 4.7" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.8a4 4 0 018 0v2.7M12 14.5v2.5" />
    </svg>
  )
}

function TapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <path d="M10 11V5.5a1.8 1.8 0 013.6 0V13" />
      <path d="M13.6 10.5a1.7 1.7 0 013.4 0v1M17 11.5a1.7 1.7 0 013.4 0V16a5 5 0 01-5 5h-1.9a5 5 0 01-4.2-2.3l-2.6-4a1.7 1.7 0 012.7-2l1.6 1.8" />
    </svg>
  )
}

function SwitchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
      <rect x="2.5" y="7.5" width="19" height="9" rx="4.5" />
      <circle cx="16.5" cy="12" r="2.6" fill="currentColor" stroke="none" />
    </svg>
  )
}
