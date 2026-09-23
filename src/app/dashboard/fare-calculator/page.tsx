import type { Metadata } from 'next'
import FareForm from '@/components/fare-form'

export const metadata: Metadata = {
  title: 'Fare calculator',
}

export default function FareCalculatorPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white light:text-navy">
          Fare calculator
        </h1>
        <p className="mt-1 text-sm text-slate-400 light:text-slate-500">
          Estimate a fare using the NTA national maximum taxi fare rates.
        </p>
      </div>

      <FareForm />

      <p className="text-xs text-slate-500 light:text-slate-400">
        An estimate based on typical driving distance and time between the
        two addresses — the actual meter fare can differ with traffic, the
        exact route taken, tolls, or extras.
      </p>
    </div>
  )
}
