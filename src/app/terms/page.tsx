import Link from 'next/link'
import type { Metadata } from 'next'
import Wordmark from '@/components/wordmark'

export const metadata: Metadata = {
  title: 'Terms — TaxiCard',
  description: 'The terms for using TaxiCard.',
}

const UPDATED = '4 September 2026'

export default function TermsPage() {
  return (
    <main className="tc-dark-page w-full px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.5rem)] text-white">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark size="sm" />
        </Link>

        <h1 className="text-3xl font-semibold">Terms</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated {UPDATED}</p>

        <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-slate-300">
          <section className="rounded-2xl border border-yellow/30 bg-yellow/10 p-4 text-sm text-yellow">
            A starting point, not finished legal advice. Have a solicitor
            review this before real drivers sign up.
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">What TaxiCard is</h2>
            <p className="mt-2">
              TaxiCard gives an independent taxi driver a booking page and a
              private customer list. We are not a taxi company and not a
              dispatch service. We do not carry passengers, set fares, or
              take any part in the journey. The contract for a journey is
              between the passenger and the driver.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">For drivers</h2>
            <ul className="mt-3 space-y-1.5 pl-5">
              <li className="list-disc">
                You must hold a valid SPSV licence and the insurance the law
                requires. You are responsible for keeping them current.
              </li>
              <li className="list-disc">
                You are the controller of your own customer records. Use them
                to serve your passengers, not to send marketing they did not
                ask for.
              </li>
              <li className="list-disc">
                Keep your details accurate. A card showing the wrong vehicle
                or number is worse than no card.
              </li>
              <li className="list-disc">
                We may suspend an account that is being used to mislead
                passengers or to hold data unlawfully.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">For passengers</h2>
            <p className="mt-2">
              Sending a booking is a request, not a confirmed journey, until
              the driver accepts it. Fares, punctuality and the journey itself
              are matters between you and the driver.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Availability</h2>
            <p className="mt-2">
              We try to keep the service running but cannot guarantee it is
              always available. Do not rely on it alone for a journey you
              cannot miss.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Cost</h2>
            <p className="mt-2">
              TaxiCard is free while we build it out. We take no commission on
              fares. If we introduce paid plans we will say so clearly before
              anything is charged.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Law</h2>
            <p className="mt-2">
              These terms are governed by the law of Ireland.
            </p>
          </section>
        </div>

        <div className="mt-10 flex gap-4 text-sm">
          <Link href="/privacy" className="text-brandblue">
            Privacy
          </Link>
          <Link href="/" className="text-slate-400">
            Home
          </Link>
        </div>
      </div>
    </main>
  )
}
