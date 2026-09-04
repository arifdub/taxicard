import Link from 'next/link'
import QRCode from 'qrcode'
import type { Metadata } from 'next'
import { siteUrl } from '@/lib/site'

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
        <span className="text-lg font-semibold">TaxiCard</span>
        <Link
          href="/login"
          className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
        >
          Driver log in
        </Link>
      </nav>

      <header className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:pb-24 md:pt-14">
        <p className="tc-left text-sm font-semibold uppercase tracking-wide text-yellow">
          For independent taxi drivers
        </p>
        <h1 className="tc-left tc-d1 mt-3 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
          Your customers already know you. Make it one tap to book you.
        </h1>
        <p className="tc-left tc-d2 mt-5 max-w-xl text-base text-slate-300 md:text-lg">
          TaxiCard gives you your own booking page and QR code. Your regulars
          scan it once, save it, and book you directly — instead of ringing you
          while you are driving, or opening an app that hands the job to
          someone else.
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
          No commission. No dispatch. No app for your customers to download.
        </p>
      </header>

      <section className="tc-band py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-5 md:grid-cols-2">
          <div className="flex justify-center">
            <PhoneMock qr={sampleQr} />
          </div>

          <div>
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
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-2xl font-semibold md:text-3xl">How it works</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            <Step
              n="1"
              title="Set up your card"
              body="Your name, photo, phone, vehicle and service area. Takes a few minutes and you choose your own link, like taxicard.ie/john."
            />
            <Step
              n="2"
              title="Print your QR code"
              body="Download it and put it on business cards, in the back of the car, on a flyer. One scan opens your page. Nothing to install."
            />
            <Step
              n="3"
              title="Take bookings directly"
              body="A request arrives with pickup, destination and time. You accept or decline. The customer sees the confirmation and your number."
            />
          </ol>
        </div>
      </section>

      <section className="tc-band py-16">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-2xl font-semibold md:text-3xl">
            This is not another taxi app
          </h2>
          <p className="mt-3 max-w-2xl text-slate-300">
            There is no pool of drivers and no matching. A customer who opens
            your card books you, or nobody. The work you have built up stays
            yours.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Point
              title="Your own customer list"
              body="Every booking builds it. Sarah books you once and you have her number, her usual pickup and her history — recognised automatically the next time, even if she writes her number differently."
            />
            <Point
              title="Nobody else can see it"
              body="Every driver's customers and bookings are walled off at database level, not just hidden in the app. Another driver on TaxiCard cannot reach your list."
            />
            <Point
              title="Easy for older customers"
              body="Big buttons, no login, no download. If they can open a web page, they can book you. And the call button never goes away."
            />
            <Point
              title="You stay in control"
              body="Mark yourself unavailable and your card says so, while still letting people ring you. Accept or decline every job yourself."
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Common questions
          </h2>
          <div className="mt-8 space-y-5">
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
          <span>TaxiCard — built for independent drivers in Ireland.</span>
          <Link href="/login" className="text-brandblue">
            Driver log in
          </Link>
        </div>
      </footer>
    </div>
  )
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="tc-in rounded-2xl border border-white/10 bg-navy-soft p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow text-sm font-semibold text-navy">
        {n}
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{body}</p>
    </li>
  )
}

function Point({ title, body }: { title: string; body: string }) {
  return (
    <div className="tc-in rounded-2xl border border-white/10 bg-navy-soft p-6">
      <h3 className="text-lg font-semibold text-yellow">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{body}</p>
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
      <div className="relative overflow-hidden rounded-[36px] bg-white">
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
            <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy/5 text-navy">
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
              <span className="text-[10px] font-semibold text-navy">Call John</span>
            </div>

            <div className="flex flex-col items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M20.5 11.5a7.9 7.9 0 01-11.6 7L4 20l1.6-4.6a7.9 7.9 0 1114.9-3.9z"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[10px] font-semibold text-emerald-900">
                WhatsApp
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Pass John on to a friend
            </p>
            <div
              className="mx-auto mt-2 w-20"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            <p className="mt-1.5 text-[10px] font-semibold text-navy">
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
