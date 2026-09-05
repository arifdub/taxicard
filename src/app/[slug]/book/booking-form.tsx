'use client'

import { useActionState, useState } from 'react'
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
        <input
          id="pickup"
          name="pickup"
          required
          autoComplete="street-address"
          placeholder="12 Main Street, Dublin"
          className="w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15"
        />
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
