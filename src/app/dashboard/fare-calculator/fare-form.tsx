'use client'

import { useState } from 'react'
import { Field } from '@/components/ui'

type Result = {
  band: string
  bandLabel: string
  distanceKm: number
  durationMin: number
  initial: number
  tariffA: number
  tariffB: number
  total: number
}

function toDatetimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

export default function FareForm() {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [when, setWhen] = useState(() => toDatetimeLocal(new Date()))
  const [publicHoliday, setPublicHoliday] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup,
          destination,
          when: new Date(when).toISOString(),
          publicHoliday,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
      } else {
        setResult(data)
      }
    } catch {
      setError('Could not reach the fare service. Check your connection.')
    }
    setPending(false)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Pickup address"
          name="pickup"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          placeholder="12 Harcourt Street, Dublin"
          required
        />
        <Field
          label="Destination address"
          name="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Dublin Airport"
          required
        />
        <Field
          label="Date and time"
          name="when"
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
          hint="The rate band (Standard, Premium, or Special) depends on when the trip happens."
        />
        <label className="flex items-center gap-2 text-sm text-slate-300 light:text-slate-600">
          <input
            type="checkbox"
            checked={publicHoliday}
            onChange={(e) => setPublicHoliday(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 light:border-slate-300"
          />
          Public holiday
        </label>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-yellow px-4 py-3.5 text-base font-semibold text-navy disabled:opacity-60"
        >
          {pending ? 'Calculating…' : 'Calculate fare'}
        </button>
      </form>

      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="space-y-3 rounded-2xl border border-white/10 light:border-slate-200 bg-navy-soft light:bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-yellow">
              {result.bandLabel}
            </span>
            <span className="text-sm text-slate-400 light:text-slate-500">
              {result.distanceKm} km &middot; {result.durationMin} min
            </span>
          </div>

          <div className="space-y-1 text-sm text-slate-300 light:text-slate-600">
            <div className="flex justify-between">
              <span>Initial charge</span>
              <span>&euro;{result.initial.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tariff A</span>
              <span>&euro;{result.tariffA.toFixed(2)}</span>
            </div>
            {result.tariffB > 0 ? (
              <div className="flex justify-between">
                <span>Tariff B</span>
                <span>&euro;{result.tariffB.toFixed(2)}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 light:border-slate-200 pt-3">
            <span className="text-base font-semibold text-white light:text-navy">
              Estimated fare
            </span>
            <span className="text-2xl font-bold text-yellow">
              &euro;{result.total.toFixed(2)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
