import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TaxiCard — your own digital taxi card and booking page',
  description:
    'Independent taxi drivers in Ireland: give your regular customers a QR code they can scan to book you directly. Your customers, your business, no marketplace.',
}

export default function Home() {
  return (
    <div className="bg-white">
      <header className="bg-navy">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="text-lg font-semibold text-white">TaxiCard</span>
          <Link href="/login" className="text-sm font-medium text-slate-200">
            Driver log in
          </Link>
        </nav>

        <div className="mx-auto max-w-5xl px-5 pb-16 pt-10 md:pb-24 md:pt-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-yellow">
            For independent taxi drivers
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-white md:text-5xl">
            Your customers already know you. Make it one tap to book you.
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-300 md:text-lg">
            TaxiCard gives you your own booking page and QR code. Your regulars
            scan it once, save it, and book you directly — instead of ringing
            you while you are driving, or opening an app that hands the job to
            someone else.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-xl bg-yellow px-6 py-4 text-center text-base font-semibold text-navy"
            >
              Create your taxi card — free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-600 px-6 py-4 text-center text-base font-medium text-white"
            >
              I already have an account
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            No commission. No dispatch. No app for your customers to download.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-2xl font-semibold text-navy md:text-3xl">
          How it works
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
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
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-2xl font-semibold text-navy md:text-3xl">
            This is not another taxi app
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            There is no pool of drivers and no matching. A customer who opens
            your card books you, or nobody. The work you have built up stays
            yours.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Point
              title="Your own customer list"
              body="Every booking builds it. Sarah books you once and you have her number, her usual pickup and her history — recognised automatically the next time she books, even if she writes her number differently."
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

      <section className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-2xl font-semibold text-navy md:text-3xl">
          Common questions
        </h2>
        <div className="mt-8 space-y-6">
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
      </section>

      <section className="bg-navy py-16">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">
            Set up your card today
          </h2>
          <p className="mt-3 text-slate-300">
            A few minutes now, and your next regular can book you with two taps.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-yellow px-8 py-4 text-base font-semibold text-navy"
          >
            Create your taxi card
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-5 py-10 text-sm text-slate-500">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>TaxiCard — built for independent drivers in Ireland.</span>
          <Link href="/login" className="text-blue-700">
            Driver log in
          </Link>
        </div>
      </footer>
    </div>
  )
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-slate-200 p-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow text-sm font-semibold text-navy">
        {n}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </li>
  )
}

function Point({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white p-6">
      <h3 className="text-lg font-semibold text-navy">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  )
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-slate-200 pb-6">
      <h3 className="font-semibold text-navy">{q}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{a}</p>
    </div>
  )
}
