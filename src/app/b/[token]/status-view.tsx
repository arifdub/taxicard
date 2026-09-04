'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type BookingStatus = {
  status: string
  pickup_address: string
  destination_address: string | null
  booking_type: string
  scheduled_at: string | null
  driver_name: string
  business_name: string | null
  driver_phone: string | null
}

const LOOKS = {
  PENDING: {
    tone: 'bg-amber-50 text-amber-900 border-amber-200',
    head: 'Booking request sent',
  },
  CONFIRMED: {
    tone: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    head: 'Booking confirmed',
  },
  ACCEPTED: {
    tone: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    head: 'Booking confirmed',
  },
  COMPLETED: {
    tone: 'bg-slate-100 text-slate-800 border-slate-200',
    head: 'Trip completed',
  },
  DECLINED: {
    tone: 'bg-red-50 text-red-900 border-red-200',
    head: 'Not able to take this one',
  },
  CANCELLED: {
    tone: 'bg-slate-100 text-slate-800 border-slate-200',
    head: 'Booking cancelled',
  },
} as const

function subline(b: BookingStatus) {
  const first = b.driver_name.split(' ')[0]
  switch (b.status) {
    case 'PENDING':
      return `${first} has been notified. This page updates on its own.`
    case 'CONFIRMED':
    case 'ACCEPTED':
      return `${first} is expecting you.`
    case 'DECLINED':
      return `${first} cannot take this booking. Try calling, or book another time.`
    case 'COMPLETED':
      return 'Thanks for travelling.'
    default:
      return ''
  }
}

export default function StatusView({
  token,
  initial,
}: {
  token: string
  initial: BookingStatus
}) {
  const [booking, setBooking] = useState(initial)

  // Anonymous visitors have no read access to the bookings table, so
  // realtime cannot deliver to them. Polling the token RPC keeps the
  // security model intact at the cost of a request every few seconds.
  useEffect(() => {
    if (['CONFIRMED', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED'].includes(booking.status)) {
      return
    }
    const supabase = createClient()
    const id = setInterval(async () => {
      const { data } = await supabase.rpc('get_booking_by_token', {
        p_token: token,
      })
      if (data) setBooking(data as BookingStatus)
    }, 6000)
    return () => clearInterval(id)
  }, [token, booking.status])

  const look = LOOKS[booking.status as keyof typeof LOOKS] ?? LOOKS.PENDING
  const when =
    booking.booking_type === 'NOW' || !booking.scheduled_at
      ? 'As soon as possible'
      : new Date(booking.scheduled_at).toLocaleString(undefined, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border px-5 py-6 text-center ${look.tone}`}>
        <h1 className="text-xl font-semibold">{look.head}</h1>
        <p className="mt-2 text-sm">{subline(booking)}</p>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
        <Row label="Driver" value={booking.business_name ?? booking.driver_name} />
        <Row label="Pickup" value={booking.pickup_address} />
        {booking.destination_address ? (
          <Row label="Destination" value={booking.destination_address} />
        ) : null}
        <Row label="When" value={when} />
      </div>

      {booking.driver_phone ? (
        <a
          href={`tel:${booking.driver_phone.replace(/\s/g, '')}`}
          className="block rounded-xl bg-yellow px-4 py-4 text-center text-lg font-semibold text-navy"
        >
          Call {booking.driver_name.split(' ')[0]}
        </a>
      ) : null}

      <p className="text-center text-xs text-slate-400">
        Save this page to check your booking later.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}
