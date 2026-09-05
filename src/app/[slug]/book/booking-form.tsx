'use client'

import { useActionState, useRef, useState } from 'react'
import { createBooking, type BookingState } from './actions'

const initial: BookingState = {}

export default function BookingForm({
  slug,
  driverName,
}: {
  slug: string
  driverName: string
}) {
  const [state, action, pending] = useActionState(createBooking, initial)
  const [later, setLater] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [locating, setLocating] = useState(false)
  const [locNote, setLocNote] = useState<string | null>(null)
  const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(null)
  const pickupRef = useRef<HTMLInputElement>(null)
  const eircodeRef = useRef<HTMLInputElement>(null)

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setLocNote('Your browser cannot share a location. Type the address instead.')
      return
    }

    setLocating(true)
    setLocNote(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCoords({ lat: String(lat), lng: String(lng) })

        try {
          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`)
          const data = await res.json()

          if (data.address && pickupRef.current) {
            pickupRef.current.value = data.address
            setLocNote('Found you. Change it if that is not right.')
          } else {
            setLocNote(
              'Location saved, but we could not name the street. Please type it.'
            )
          }

          if (data.eircode && eircodeRef.current && !eircodeRef.current.value) {
            eircodeRef.current.value = data.eircode
          }
        } catch {
          setLocNote('Location saved. Please type the address as well.')
        }

        setLocating(false)
      },
      () => {
        setLocating(false)
        setLocNote('Could not get your location. Type the address instead.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }

  // Built in the browser so the time means what the passenger meant,
  // rather than being read as UTC on the server.
  const scheduledAt =
    later && date && time ? new Date(`${date}T${time}`).toISOString() : ''

  const firstName = driverName.split(' ')[0]

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="when" value={later ? 'LATER' : 'NOW'} />
      <input type="hidden" name="scheduled_at" value={scheduledAt} />
      <input type="hidden" name="pickup_lat" value={coords?.lat ?? ''} />
      <input type="hidden" name="pickup_lng" value={coords?.lng ?? ''} />

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200"
        >
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="pickup" className="mb-1 block text-xs font-semibold text-slate-400">
          Where should {firstName} collect you?
        </label>
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

        <input
          ref={pickupRef}
          id="pickup"
          name="pickup"
          required
          autoComplete="street-address"
          placeholder="12 Main Street, Dublin"
          className="w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15"
        />
      </div>

      {locNote ? (
        <p className="-mt-3 text-xs text-slate-400">{locNote}</p>
      ) : null}

      <div>
        <label htmlFor="eircode" className="mb-1 block text-xs font-semibold text-slate-400">
          Eircode (optional)
        </label>
        <input
          ref={eircodeRef}
          id="eircode"
          name="eircode"
          maxLength={8}
          autoCapitalize="characters"
          placeholder="D15 XY12"
          className="w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base uppercase text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15"
        />
        <p className="mt-1 text-xs text-slate-500">
          Helps the driver find your door first time.
        </p>
      </div>

      <div>
        <label htmlFor="destination" className="mb-1 block text-xs font-semibold text-slate-400">
          Where are you going?
        </label>
        <input
          id="destination"
          name="destination"
          required
          placeholder="Dublin Airport, T1"
          className="w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15"
        />
      </div>

      <div>
        <span className="mb-1 block text-xs font-semibold text-slate-400">
          When do you need the taxi?
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLater(false)}
            className={`rounded-xl px-4 py-3.5 text-base font-medium ${
              later
                ? 'border border-white/15 bg-navy-soft text-slate-200'
                : 'bg-yellow text-navy'
            }`}
          >
            Now
          </button>
          <button
            type="button"
            onClick={() => setLater(true)}
            className={`rounded-xl px-4 py-3.5 text-base font-medium ${
              later
                ? 'bg-yellow text-navy'
                : 'border border-white/15 bg-navy-soft text-slate-200'
            }`}
          >
            Later
          </button>
        </div>
      </div>

      {later ? (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            aria-label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base text-white outline-none"
          />
          <input
            type="time"
            aria-label="Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base text-white outline-none"
          />
        </div>
      ) : null}

      <div className="space-y-3 border-t border-white/10 pt-5">
        <div>
          <label htmlFor="name" className="mb-1 block text-xs font-semibold text-slate-400">
            Your name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className="w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-xs font-semibold text-slate-400">
            Your mobile
          </label>
          <input
            id="phone"
            name="phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="087 123 4567"
            className="w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15"
          />
          <p className="mt-1 text-xs text-slate-500">
            {firstName} needs this to confirm and to find you.
          </p>
        </div>
        <div>
          <label htmlFor="notes" className="mb-1 block text-xs font-semibold text-slate-400">
            Anything else? (optional)
          </label>
          <input
            id="notes"
            name="notes"
            maxLength={280}
            placeholder="Two bags, flight at 10:30"
            className="w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-yellow px-4 py-4 text-lg font-semibold text-navy shadow-[0_12px_30px_-14px_rgba(255,199,44,0.9)] disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send booking request'}
      </button>

      <p className="text-center text-xs text-slate-500">
        This sends a request. {firstName} will confirm it.
      </p>
    </form>
  )
}
