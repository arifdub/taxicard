import Link from 'next/link'
import type { Metadata } from 'next'
import Wordmark from '@/components/wordmark'
import FareForm from '@/components/fare-form'

export const metadata: Metadata = {
  title: 'Taxi fare calculator',
  description:
    'Estimate an Irish taxi fare between two addresses using the NTA national maximum taxi fare rates.',
  alternates: { canonical: '/fare' },
}

export default function FarePage() {
  return (
    <main className="tc-dark-page w-full px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.5rem)] text-white">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark size="sm" />
        </Link>

        <h1 className="text-2xl font-semibold md:text-3xl">
          Taxi fare calculator
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Estimate a fare using the NTA national maximum taxi fare rates —
          enter a pickup and destination, or use your current location.
        </p>

        <div className="mt-6">
          <FareForm />
        </div>

        <p className="mt-6 text-xs text-slate-500">
          An estimate based on typical driving distance and time between the
          two addresses — the actual meter fare can differ with traffic, the
          exact route taken, tolls, or extras.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-brandblue">
            Back home
          </Link>
          <Link href="/signup" className="text-brandblue">
            Create a driver account
          </Link>
        </div>
      </div>
    </main>
  )
}
