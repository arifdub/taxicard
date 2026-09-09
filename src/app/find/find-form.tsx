'use client'

import { useActionState, useRef, useState } from 'react'
import { postPublicJob, type FindState } from './actions'

const initial: FindState = {}
const field =
  'w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15'
const label = 'mb-1 block text-xs font-semibold text-slate-400'

export default function FindForm() {
  const [state, action, pending] = useActionState(postPublicJob, initial)
  const [later, setLater] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [locating, setLocating] = useState(false)
  const [locNote, setLocNote] = useState<string | null>(null)
  const pickupRef = useRef<HTMLInputElement>(null)
  const eircodeRef = useRef<HTMLInputElement>(null)

  const scheduledAt =
    later && date && time ? new Date(`${date}T${time}`).toISOString() : ''

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setLocNote('This browser cannot share a location. Type the address.')
      return
    }
    setLocating(true)
    setLocNote('Asking your phone for your location…')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`)
          const data = await res.json()
          if (data.address && pickupRef.current) {
            pickupRef.current.value = data.address
            setLocNote('Found you. Change it if that is not right.')
          } else {
            setLocNote('Could not name the street. Please type it.')
          }
          if (data.eircode && eircodeRef.current && !eircodeRef.current.value) {
            eircodeRef.current.value = data.eircode
          }
        } catch {
          setLocNote('Please type the address.')
        }
        setLocating(false)
      },
      () => {
        setLocating(false)
        setLocNote('Could not get your location. Type the address instead.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="when" value={later ? 'LATER' : 'NOW'} />
      <input type="hidden" name="scheduled_at" value={scheduledAt} />

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200"
        >
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="pickup" className={label}>
          Where should we collect you?
        </label>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="mb-2 w-full rounded-2xl border border-yellow/40 bg-yellow/10 px-4 py-3 text-sm font-semibold text-yellow disabled:opacity-60"
        >
          {locating ? 'Finding you…' : 'Use my current location'}
        </button>
        <input
          ref={pickupRef}
          id="pickup"
          name="pickup"
          required
          autoComplete="street-address"
          placeholder="12 Main Street, Dublin"
          className={field}
        />
        {locNote ? (
          <p className="mt-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
            {locNote}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="eircode" className={label}>
          Eircode (optional)
        </label>
        <input
          ref={eircodeRef}
          id="eircode"
          name="eircode"
          maxLength={8}
          autoCapitalize="characters"
          placeholder="D15 XY12"
          className={`${field} uppercase`}
        />
      </div>

      <div>
        <label htmlFor="destination" className={label}>
          Where are you going? (optional)
        </label>
        <input
          id="destination"
          name="destination"
          placeholder="Dublin Airport, T1"
          className={field}
        />
      </div>

      <div>
        <span className={label}>When do you need the taxi?</span>
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
            className={field}
          />
          <input
            type="time"
            aria-label="Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className={field}
          />
        </div>
      ) : null}

      <div className="space-y-3 border-t border-white/10 pt-5">
        <div>
          <label htmlFor="name" className={label}>
            Your name
          </label>
          <input id="name" name="name" required autoComplete="name" className={field} />
        </div>
        <div>
          <label htmlFor="phone" className={label}>
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
            className={field}
          />
          <p className="mt-1 text-xs text-slate-500">
            Only shown to the driver who takes your job.
          </p>
        </div>
        <div>
          <label htmlFor="notes" className={label}>
            Anything else? (optional)
          </label>
          <input
            id="notes"
            name="notes"
            maxLength={280}
            placeholder="Two bags, flight at 10:30"
            className={field}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-yellow px-4 py-4 text-lg font-semibold text-navy shadow-[0_12px_30px_-14px_rgba(255,199,44,0.9)] disabled:opacity-60"
      >
        {pending ? 'Posting…' : 'Find me a driver'}
      </button>

      <p className="text-center text-xs leading-relaxed text-slate-500">
        Goes to licensed drivers on our business plan. The first to accept
        will be in touch. See our{' '}
        <a href="/privacy" className="text-brandblue underline">
          privacy notice
        </a>
        .
      </p>
    </form>
  )
}
