'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateBookingStatus } from '@/app/dashboard/bookings/actions'

type Incoming = {
  id: string
  pickup_address: string
  destination_address: string | null
  booking_type: string
  scheduled_at: string | null
  customer_notes: string | null
  customer_name: string
  customer_phone: string
}

/**
 * Rings and takes over the screen when a booking lands while TaxiCard is
 * open. Browsers cannot imitate a real incoming call — no full-screen
 * takeover from the background, no ringing through silent mode — so this
 * only fires with the app on screen. Push notifications cover the rest.
 */
export default function IncomingBooking({ driverId }: { driverId: string }) {
  const router = useRouter()
  const [booking, setBooking] = useState<Incoming | null>(null)
  const [pending, setPending] = useState(false)
  const [muted, setMuted] = useState(false)

  const ctxRef = useRef<AudioContext | null>(null)
  const ringRef = useRef<number | null>(null)
  const seen = useRef<Set<string>>(new Set())

  // Browsers refuse to play sound until the person has interacted with
  // the page, so build the audio context on their first tap and keep it.
  useEffect(() => {
    function unlock() {
      if (ctxRef.current) return
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (Ctor) ctxRef.current = new Ctor()
    }
    document.addEventListener('pointerdown', unlock, { once: false })
    return () => document.removeEventListener('pointerdown', unlock)
  }, [])

  const burst = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx || muted) return
    if (ctx.state === 'suspended') void ctx.resume()

    // Two overlaid tones, the way a landline ring sounds.
    ;[440, 480].forEach((freq) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.95)
    })

    if ('vibrate' in navigator) navigator.vibrate([400, 200, 400])
  }, [muted])

  const startRinging = useCallback(() => {
    burst()
    if (ringRef.current) window.clearInterval(ringRef.current)
    ringRef.current = window.setInterval(burst, 2600)
  }, [burst])

  const stopRinging = useCallback(() => {
    if (ringRef.current) window.clearInterval(ringRef.current)
    ringRef.current = null
    if ('vibrate' in navigator) navigator.vibrate(0)
  }, [])

  const load = useCallback(
    async (id: string) => {
      if (seen.current.has(id)) return
      const supabase = createClient()
      const { data } = await supabase
        .from('bookings')
        .select(
          'id, status, pickup_address, destination_address, booking_type, scheduled_at, customer_notes, customers(name, phone)'
        )
        .eq('id', id)
        .maybeSingle()

      if (!data || data.status !== 'PENDING') return

      const c = Array.isArray(data.customers) ? data.customers[0] : data.customers
      seen.current.add(id)
      setBooking({
        id: data.id,
        pickup_address: data.pickup_address,
        destination_address: data.destination_address,
        booking_type: data.booking_type,
        scheduled_at: data.scheduled_at,
        customer_notes: data.customer_notes,
        customer_name: c?.name ?? 'Customer',
        customer_phone: c?.phone ?? '',
      })
      startRinging()
    },
    [startRinging]
  )

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('incoming-bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; status: string }
          if (row.status === 'PENDING') void load(row.id)
        }
      )
      .subscribe()

    // Backstop: if realtime drops out, a booking still surfaces within
    // twenty seconds rather than being missed entirely.
    const poll = window.setInterval(async () => {
      const { data } = await supabase
        .from('bookings')
        .select('id')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
        .limit(1)

      const latest = (data as { id: string }[] | null)?.[0]
      if (latest) void load(latest.id)
    }, 20000)

    return () => {
      void supabase.removeChannel(channel)
      window.clearInterval(poll)
      stopRinging()
    }
  }, [driverId, load, stopRinging])

  function dismiss() {
    stopRinging()
    setBooking(null)
  }

  async function decide(next: 'CONFIRMED' | 'DECLINED') {
    if (!booking) return
    setPending(true)
    stopRinging()
    await updateBookingStatus(booking.id, next)
    setPending(false)
    setBooking(null)
    router.refresh()
  }

  if (!booking) return null

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
    <div
      role="alertdialog"
      aria-label="New booking request"
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#0B1425] px-6 pb-10 pt-16 text-white"
    >
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-yellow">
          New booking
        </p>

        <div className="mx-auto mt-8 flex h-24 w-24 items-center justify-center rounded-full bg-yellow text-3xl font-bold text-navy">
          {booking.customer_name
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase()}
        </div>

        <h2 className="mt-5 text-3xl font-bold">{booking.customer_name}</h2>
        <a
          href={`tel:${booking.customer_phone.replace(/\s/g, '')}`}
          className="mt-1 inline-block text-lg text-brandblue"
        >
          {booking.customer_phone}
        </a>

        <div className="mx-auto mt-7 max-w-sm space-y-2 rounded-2xl bg-white/5 p-5 text-left">
          <p className="text-base">{booking.pickup_address}</p>
          {booking.destination_address ? (
            <p className="text-base text-slate-300">
              to {booking.destination_address}
            </p>
          ) : null}
          <p className="text-sm text-slate-400">{when}</p>
          {booking.customer_notes ? (
            <p className="text-sm text-slate-400">{booking.customer_notes}</p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-sm space-y-3">
        <button
          onClick={() => {
            setMuted(true)
            stopRinging()
          }}
          className="mx-auto block text-sm text-slate-400"
        >
          {muted ? 'Sound off' : 'Silence'}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => decide('DECLINED')}
            disabled={pending}
            className="rounded-2xl border border-red-400/40 px-4 py-5 text-lg font-semibold text-red-300 disabled:opacity-60"
          >
            Decline
          </button>
          <button
            onClick={() => decide('CONFIRMED')}
            disabled={pending}
            className="rounded-2xl bg-[#22C55E] px-4 py-5 text-lg font-semibold text-white disabled:opacity-60"
          >
            {pending ? 'Working…' : 'Accept'}
          </button>
        </div>

        <button
          onClick={dismiss}
          className="w-full py-2 text-sm text-slate-400"
        >
          Decide later
        </button>
      </div>
    </div>
  )
}
