import Link from 'next/link'
import type { Metadata } from 'next'
import Wordmark from '@/components/wordmark'

export const metadata: Metadata = {
  title: 'Privacy — TaxiCard',
  description: 'How TaxiCard handles personal data.',
}

const UPDATED = '4 September 2026'

export default function PrivacyPage() {
  return (
    <main className="tc-dark-page w-full px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.5rem)] text-white">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark size="sm" />
        </Link>

        <h1 className="text-3xl font-semibold">Privacy</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated {UPDATED}</p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-slate-300">
          <section className="rounded-2xl border border-yellow/30 bg-yellow/10 p-4 text-sm text-yellow">
            Replace the bracketed details below with your business name,
            address and contact email before publishing, and have a
            solicitor review this document.
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Who we are</h2>
            <p className="mt-2">
              TaxiCard is operated by [YOUR BUSINESS NAME], [ADDRESS],
              Ireland. For anything in this notice, contact us at
              [privacy@taxicard.ie].
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              Two different roles
            </h2>
            <p className="mt-2">
              For a driver&apos;s own account we are the data controller. For
              the passenger records inside a driver&apos;s account we act as
              a processor on that driver&apos;s instructions — the driver
              decides what is kept and for how long, and each driver can only
              see their own passengers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              If you book a taxi
            </h2>
            <p className="mt-2">We collect, when you send a booking:</p>
            <ul className="mt-3 space-y-1.5 pl-5">
              <li className="list-disc">Your name and mobile number</li>
              <li className="list-disc">
                Your pickup address, Eircode if given, and destination
              </li>
              <li className="list-disc">
                Coordinates, only if you tap &quot;use my current
                location&quot;
              </li>
              <li className="list-disc">Any note you add, and the time</li>
            </ul>
            <p className="mt-3">
              This goes to the one driver whose card you opened. No other
              driver can see it. We use it to pass the booking to that driver
              and to let them recognise you next time, which is the point of
              the service. The lawful basis is performance of a contract with
              you, and our legitimate interest in running the booking system.
            </p>
            <p className="mt-3">
              We do not sell data, we do not advertise, and we do not share
              your details with other drivers or third parties for marketing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">If you drive</h2>
            <p className="mt-2">
              We hold your name, email, phone, photo if you upload one,
              vehicle details, SPSV licence number if you enter it, your
              chosen link, and your bookings and customers. We use it to run
              your account and your public card.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              How long we keep it
            </h2>
            <p className="mt-2">
              Bookings and passenger records are kept for two years after the
              last booking, then deleted, unless the driver deletes them
              sooner. Driver accounts are kept while the account is open and
              deleted within 30 days of closure. We keep nothing longer than
              we need it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Who else is involved</h2>
            <p className="mt-2">
              We use Supabase for the database and Vercel for hosting, both
              within the EU where possible. If a driver has turned on
              notifications, Apple and Google deliver those messages. Nothing
              else receives your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Your rights</h2>
            <p className="mt-2">
              You can ask for a copy of your data, ask us to correct it, ask
              us to delete it, or object to how we use it. Write to
              [privacy@taxicard.ie] and we will respond within one month.
            </p>
            <p className="mt-3">
              If you booked a taxi and want your details removed, tell us the
              driver and the number you used, and we will remove them. You can
              also ask the driver directly.
            </p>
            <p className="mt-3">
              If you are unhappy with how we handle it, you can complain to
              the Data Protection Commission, dataprotection.ie.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Cookies</h2>
            <p className="mt-2">
              We use one cookie, to keep a driver signed in. There is no
              tracking, no analytics and no advertising, so there is no
              cookie banner.
            </p>
          </section>
        </div>

        <div className="mt-10 flex gap-4 text-sm">
          <Link href="/terms" className="text-brandblue">
            Terms
          </Link>
          <Link href="/" className="text-slate-400">
            Home
          </Link>
        </div>
      </div>
    </main>
  )
}
