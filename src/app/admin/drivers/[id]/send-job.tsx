'use client'

import { useActionState, useState } from 'react'
import { sendDriverJob, type SendJobState } from './send-job-actions'

const initial: SendJobState = {}
const field =
  'w-full rounded-xl border border-white/10 bg-[#0B1425] px-3 py-3 text-base text-white outline-none focus:border-yellow'
const label = 'mb-1 block text-xs font-semibold text-slate-400'

export default function SendJob({
  driverId,
  driverName,
}: {
  driverId: string
  driverName: string
}) {
  const [open, setOpen] = useState(false)
  const bound = sendDriverJob.bind(null, driverId)
  const [state, action, pending] = useActionState(bound, initial)
  const [later, setLater] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const scheduledAt =
    later && date && time ? new Date(`${date}T${time}`).toISOString() : ''

  const first = driverName.split(' ')[0]

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-yellow/40 bg-yellow/10 px-4 py-4 text-base font-bold text-yellow transition active:scale-[0.99]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M9.2 3.2h5.6c.5 0 .9.4.9.9v1.2h-7.4V4.1c0-.5.4-.9.9-.9z" />
          <path d="M5.6 8.1 6.9 6h10.2l1.3 2.1c1.3.2 2.2 1.3 2.2 2.6v4.7c0 .6-.5 1.1-1.1 1.1h-.7a2.3 2.3 0 0 1-4.5 0H9.7a2.3 2.3 0 0 1-4.5 0h-.7c-.6 0-1.1-.5-1.1-1.1v-4.7c0-1.3.9-2.4 2.2-2.6zm1.7.4-.8 2.4h11l-.8-2.4H7.3zM6 12.6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm12 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z" />
        </svg>
        Send {first} a job
      </button>
    )
  }

  return (
    <form
      action={action}
      className="space-y-4 rounded-2xl border border-white/10 bg-navy-soft p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Send {first} a job
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-slate-400"
        >
          Close
        </button>
      </div>

      <input type="hidden" name="when" value={later ? 'LATER' : 'NOW'} />
      <input type="hidden" name="scheduled_at" value={scheduledAt} />

      {state.error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sj-name" className={label}>
            Customer name
          </label>
          <input id="sj-name" name="name" required className={field} />
        </div>
        <div>
          <label htmlFor="sj-phone" className={label}>
            Customer mobile
          </label>
          <input
            id="sj-phone"
            name="phone"
            required
            type="tel"
            inputMode="tel"
            placeholder="087 123 4567"
            className={field}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sj-pickup" className={label}>
            Pickup
          </label>
          <input
            id="sj-pickup"
            name="pickup"
            required
            placeholder="12 Main Street, Dublin"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="sj-eircode" className={label}>
            Eircode (optional)
          </label>
          <input
            id="sj-eircode"
            name="eircode"
            maxLength={8}
            autoCapitalize="characters"
            placeholder="D15 XY12"
            className={`${field} uppercase`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="sj-destination" className={label}>
          Destination
        </label>
        <input
          id="sj-destination"
          name="destination"
          required
          placeholder="Dublin Airport, T1"
          className={field}
        />
      </div>

      <div>
        <span className={label}>When</span>
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

      <div>
        <label htmlFor="sj-fare" className={label}>
          Set fare (optional)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-slate-400">&euro;</span>
          <input
            id="sj-fare"
            name="fare"
            inputMode="decimal"
            placeholder="30.00"
            className={field}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Leave blank to estimate it automatically. If set, this is the price
          shown to {first}, in bold at the top of the job.
        </p>
      </div>

      <div>
        <label htmlFor="sj-notes" className={label}>
          Notes (optional)
        </label>
        <input
          id="sj-notes"
          name="notes"
          maxLength={280}
          placeholder="Two bags, flight at 10:30"
          className={field}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-yellow px-4 py-4 text-lg font-semibold text-navy disabled:opacity-60"
      >
        {pending ? 'Sending…' : `Send to ${first}`}
      </button>

      <p className="text-center text-xs text-slate-500">
        Goes straight to {first} only, the same way a passenger&apos;s trip
        details would. Nobody else sees it.
      </p>
    </form>
  )
}
