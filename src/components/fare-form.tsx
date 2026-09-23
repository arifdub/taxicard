'use client'

import { useState } from 'react'
import { Field } from '@/components/ui'
import { BOOKING_FEE } from '@/lib/fare'

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

const MAX_PASSENGERS = 8
const PASSENGER_EXTRA = 1

export default function FareForm() {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [when, setWhen] = useState(() => toDatetimeLocal(new Date()))
  const [publicHoliday, setPublicHoliday] = useState(false)
  const [passengers, setPassengers] = useState(1)
  const [bookingFee, setBookingFee] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [locating, setLocating] = useState(false)
  const [locNote, setLocNote] = useState<string | null>(null)

  const passengerExtra = (passengers - 1) * PASSENGER_EXTRA
  const extrasTotal = passengerExtra + (bookingFee ? BOOKING_FEE : 0)

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setLocNote('This browser cannot share a location. Type the address instead.')
      return
    }

    setLocating(true)
    setLocNote('Asking your phone for your location…')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLocNote('Got it. Looking up the address…')

        try {
          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`)
          const data = await res.json()

          if (data.address) {
            setPickup(data.address)
            setLocNote('Found you. Change it if that is not right.')
          } else {
            setLocNote('Could not name the street there. Please type it.')
          }
        } catch {
          setLocNote('Could not look up that location. Type the address instead.')
        }

        setLocating(false)
      },
      (err) => {
        setLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setLocNote(
            'Location is blocked for this site. Allow it in your phone settings, or just type the address.'
          )
        } else if (err.code === err.TIMEOUT) {
          setLocNote('That took too long. Try again, or type the address.')
        } else {
          setLocNote('Could not get your location. Type the address instead.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

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
        <div>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow/40 bg-yellow/10 px-4 py-3 text-sm font-semibold text-yellow disabled:opacity-60"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M12 3v3M12 18v3M3 12h3M18 12h3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            {locating ? 'Finding you…' : 'Use my current location'}
          </button>

          {locNote ? (
            <p className="mb-2 rounded-xl bg-white/5 light:bg-navy/5 px-3 py-2 text-xs text-slate-300 light:text-slate-600">
              {locNote}
            </p>
          ) : null}

          <Field
            label="Pickup address"
            name="pickup"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Harcourt Street, Dublin, or an Eircode"
            hint="Full address, Eircode, or just a town — whatever's easiest."
            required
          />
        </div>
        <Field
          label="Destination address"
          name="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="D02 AF30, or Dublin Airport"
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

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-slate-400 light:text-slate-500">
            Passengers
          </span>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: MAX_PASSENGERS }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPassengers(n)}
                aria-pressed={passengers === n}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold ${
                  passengers === n
                    ? 'bg-yellow text-navy'
                    : 'border border-white/15 light:border-slate-200 text-slate-300 light:text-slate-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-500 light:text-slate-400">
            First passenger free, then &euro;{PASSENGER_EXTRA.toFixed(2)} each extra.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300 light:text-slate-600">
          <input
            type="checkbox"
            checked={bookingFee}
            onChange={(e) => setBookingFee(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 light:border-slate-300"
          />
          Pre-booked (&euro;{BOOKING_FEE.toFixed(2)} booking fee)
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
              <span>Tariff A ({result.bandLabel})</span>
              <span>&euro;{result.tariffA.toFixed(2)}</span>
            </div>
            {result.tariffB > 0 ? (
              <div className="flex justify-between">
                <span>Tariff B ({result.bandLabel})</span>
                <span>&euro;{result.tariffB.toFixed(2)}</span>
              </div>
            ) : null}
            {passengerExtra > 0 ? (
              <div className="flex justify-between">
                <span>Extra passengers ({passengers - 1})</span>
                <span>&euro;{passengerExtra.toFixed(2)}</span>
              </div>
            ) : null}
            {bookingFee ? (
              <div className="flex justify-between">
                <span>Booking fee</span>
                <span>&euro;{BOOKING_FEE.toFixed(2)}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 light:border-slate-200 pt-3">
            <span className="text-base font-semibold text-white light:text-navy">
              Estimated fare
            </span>
            <span className="text-2xl font-bold text-yellow">
              &euro;{(result.total + extrasTotal).toFixed(2)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
