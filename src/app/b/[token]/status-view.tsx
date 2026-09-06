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
  driver_slug: string | null
  driver_phone: string | null
}

const LOOKS = {
  PENDING: {
    tone: 'bg-amber-500/10 text-amber-100 border-amber-400/30',
    head: 'Booking request sent',
  },
  CONFIRMED: {
    tone: 'bg-emerald-500/10 text-emerald-100 border-emerald-400/30',
    head: 'Booking confirmed',
  },
  ACCEPTED: {
    tone: 'bg-emerald-500/10 text-emerald-100 border-emerald-400/30',
    head: 'Booking confirmed',
  },
  COMPLETED: {
    tone: 'bg-white/5 text-slate-200 border-white/10',
    head: 'Trip completed',
  },
  DECLINED: {
    tone: 'bg-red-500/10 text-red-100 border-red-400/30',
    head: 'Not able to take this one',
  },
  CANCELLED: {
    tone: 'bg-white/5 text-slate-200 border-white/10',
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

      <div className="space-y-2 rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm">
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
          className="block rounded-2xl bg-yellow px-4 py-4 text-center text-lg font-semibold text-navy shadow-[0_12px_30px_-14px_rgba(255,199,44,0.9)]"
        >
          Call {booking.driver_name.split(' ')[0]}
        </a>
      ) : null}

      {booking.driver_slug ? (
        <a
          href={`/${booking.driver_slug}`}
          className="block rounded-2xl border border-white/15 bg-navy-soft px-4 py-4 text-center text-base font-semibold text-white"
        >
          Back to {booking.driver_name.split(' ')[0]}&apos;s card
        </a>
      ) : null}

      <p className="text-center text-xs text-slate-500">
        Save this page to check your booking later, or add the card to your
        home screen to book again in one tap.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}
