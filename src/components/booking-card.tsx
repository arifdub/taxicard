'use client'

import { useState, useTransition } from 'react'
import { updateBookingStatus } from '@/app/dashboard/bookings/actions'

export type BookingRow = {
  id: string
  status: string
  pickup_address: string
  destination_address: string | null
  booking_type: string
  scheduled_at: string | null
  customer_notes: string | null
  created_at: string
  customer_name: string
  customer_phone: string
}

const BADGE: Record<string, string> = {
  PENDING: 'bg-amber-400/20 text-amber-200 ring-1 ring-amber-400/30',
  CONFIRMED: 'bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-400/30',
  ACCEPTED: 'bg-emerald-400/20 text-emerald-200 ring-1 ring-emerald-400/30',
  COMPLETED: 'bg-white/10 text-slate-300 ring-1 ring-white/15',
  DECLINED: 'bg-red-500/20 text-red-200',
  CANCELLED: 'bg-white/10 text-slate-300 ring-1 ring-white/15',
}

export function whenLabel(b: BookingRow) {
  if (b.booking_type === 'NOW' || !b.scheduled_at) return 'As soon as possible'
  return new Date(b.scheduled_at).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function BookingCard({ booking }: { booking: BookingRow }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function move(next: string) {
    setError(null)
    start(async () => {
      const res = await updateBookingStatus(booking.id, next)
      if (res.error) setError(res.error)
    })
  }

  const isPending = booking.status === 'PENDING'
  const isLive = booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED'

  return (
    <div className="rounded-2xl border border-white/10 bg-navy-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-white">{booking.customer_name}</p>
          <a
            href={`tel:${booking.customer_phone.replace(/\s/g, '')}`}
            className="text-sm font-medium text-brandblue"
          >
            {booking.customer_phone}
          </a>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            BADGE[booking.status] ?? 'bg-white/10 text-slate-300'
          }`}
        >
          {booking.status.toLowerCase()}
        </span>
      </div>

      <div className="mt-3 space-y-1 rounded-xl bg-navy-soft/5 p-3 text-sm">
        <p>{booking.pickup_address}</p>
        {booking.destination_address ? (
          <p className="text-slate-300">to {booking.destination_address}</p>
        ) : null}
        <p className="text-slate-400">{whenLabel(booking)}</p>
        {booking.customer_notes ? (
          <p className="text-slate-400">{booking.customer_notes}</p>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}

      {isPending ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => move('CONFIRMED')}
            disabled={pending}
            className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            Accept
          </button>
          <button
            onClick={() => move('DECLINED')}
            disabled={pending}
            className="rounded-xl border border-red-400/40 px-4 py-3 text-sm font-medium text-red-300 disabled:opacity-60"
          >
            Decline
          </button>
        </div>
      ) : null}

      {isLive ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => move('COMPLETED')}
            disabled={pending}
            className="rounded-xl bg-yellow px-4 py-3 text-sm font-semibold text-navy disabled:opacity-60"
          >
            Mark completed
          </button>
          <button
            onClick={() => move('CANCELLED')}
            disabled={pending}
            className="rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-slate-200 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  )
}
