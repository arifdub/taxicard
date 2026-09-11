'use client'

import { useActionState, useState } from 'react'
import {
  createDispatchJob,
  updateDispatchJob,
  type DispatchState,
} from './actions'

const initial: DispatchState = {}
const field =
  'w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15'
const label = 'mb-1 block text-xs font-semibold text-slate-400'

export type JobDefaults = {
  id: string
  customer_name: string
  customer_phone: string
  pickup_address: string
  pickup_eircode: string | null
  destination_address: string | null
  booking_type: string
  scheduled_at: string | null
  notes: string | null
  fare: number | null
}

export default function JobForm({ job }: { job?: JobDefaults }) {
  const editing = Boolean(job)
  const boundUpdate = job ? updateDispatchJob.bind(null, job.id) : null

  const [state, action, pending] = useActionState(
    boundUpdate ?? createDispatchJob,
    initial
  )

  const startsLater = job?.booking_type === 'LATER'
  const when = job?.scheduled_at ? new Date(job.scheduled_at) : null
  const pad = (n: number) => String(n).padStart(2, '0')

  const [later, setLater] = useState(startsLater)
  const [date, setDate] = useState(
    when && startsLater
      ? `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}`
      : ''
  )
  const [time, setTime] = useState(
    when && startsLater ? `${pad(when.getHours())}:${pad(when.getMinutes())}` : ''
  )

  const scheduledAt =
    later && date && time ? new Date(`${date}T${time}`).toISOString() : ''

  return (
    <form action={action} className="space-y-4">
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
          <label htmlFor="name" className={label}>
            Customer name
          </label>
          <input defaultValue={job?.customer_name} id="name" name="name" required className={field} />
        </div>
        <div>
          <label htmlFor="phone" className={label}>
            Customer mobile
          </label>
          <input
            defaultValue={job?.customer_phone}
            id="phone"
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
          <label htmlFor="pickup" className={label}>
            Pickup
          </label>
          <input
            defaultValue={job?.pickup_address}
            id="pickup"
            name="pickup"
            required
            placeholder="12 Main Street, Dublin"
            className={field}
          />
        </div>
        <div>
          <label htmlFor="eircode" className={label}>
            Eircode (optional)
          </label>
          <input
            defaultValue={job?.pickup_eircode ?? undefined}
            id="eircode"
            name="eircode"
            maxLength={8}
            autoCapitalize="characters"
            placeholder="D15 XY12"
            className={`${field} uppercase`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="destination" className={label}>
          Destination (optional)
        </label>
        <input
          defaultValue={job?.destination_address ?? undefined}
          id="destination"
          name="destination"
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
        <label htmlFor="fare" className={label}>
          Set fare (optional)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-slate-400">&euro;</span>
          <input
            defaultValue={job?.fare != null ? String(job.fare) : undefined}
            id="fare"
            name="fare"
            inputMode="decimal"
            placeholder="25.00"
            className={field}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Leave blank for the driver to agree it with the customer.
        </p>
      </div>

      <div>
        <label htmlFor="notes" className={label}>
          Notes (optional)
        </label>
        <input
          defaultValue={job?.notes ?? undefined}
          id="notes"
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
        {pending
          ? editing
            ? 'Saving…'
            : 'Sending…'
          : editing
            ? 'Save changes'
            : 'Send to business drivers'}
      </button>

      <p className="text-center text-xs text-slate-500">
        {editing
          ? 'If a driver has already taken this job, their booking updates and they are notified.'
          : 'Goes to every available driver on the business plan. The first to take it gets the job, and the customer becomes theirs.'}
      </p>
    </form>
  )
}
