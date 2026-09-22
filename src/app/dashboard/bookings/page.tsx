import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchBookings, fetchDispatchJobMap } from '@/lib/bookings'
import BookingCard from '@/components/booking-card'

export const dynamic = 'force-dynamic'

const VIEWS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Waiting' },
  { id: 'today', label: 'Today' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'past', label: 'Past' },
] as const

type View = (typeof VIEWS)[number]['id']

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const view: View = (VIEWS.find((v) => v.id === params.view)?.id ??
    'all') as View

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const [pending, accepted, past] = await Promise.all([
    fetchBookings(supabase, { driverId: user.id, statuses: ['PENDING'] }),
    fetchBookings(supabase, {
      driverId: user.id,
      statuses: ['CONFIRMED', 'ACCEPTED'],
    }),
    fetchBookings(supabase, {
      driverId: user.id,
      statuses: ['COMPLETED', 'DECLINED', 'CANCELLED'],
      limit: 30,
      newestFirst: true,
    }),
  ])

  // Soonest work first, with anything wanted now at the top.
  const orderAccepted = [...accepted].sort((a, b) => {
    const aNow = a.booking_type === 'NOW' || !a.scheduled_at
    const bNow = b.booking_type === 'NOW' || !b.scheduled_at
    if (aNow !== bNow) return aNow ? -1 : 1
    const at = new Date(a.scheduled_at ?? 0).getTime()
    const bt = new Date(b.scheduled_at ?? 0).getTime()
    return aNow && bNow ? bt - at : at - bt
  })

  const today = orderAccepted.filter((b) => {
    if (!b.scheduled_at) return true
    const t = new Date(b.scheduled_at).getTime()
    return t >= startOfDay.getTime() && t < endOfDay.getTime()
  })

  const { data: me } = await supabase
    .from('profiles')
    .select('can_dispatch, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  const jobMap =
    me?.can_dispatch || me?.is_admin
      ? await fetchDispatchJobMap(
          supabase,
          [...pending, ...orderAccepted, ...past].map((b) => b.id)
        )
      : {}

  const counts: Record<View, number> = {
    all: pending.length + orderAccepted.length + past.length,
    pending: pending.length,
    today: today.length,
    accepted: orderAccepted.length,
    past: past.length,
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-white light:text-navy">Bookings</h1>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {VIEWS.map((v) => (
          <Link
            key={v.id}
            href={`/dashboard/bookings?view=${v.id}`}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${
              view === v.id
                ? 'bg-white text-navy'
                : 'border border-white/15 light:border-slate-200 bg-white/5 light:bg-navy/5 text-slate-300 light:text-slate-600'
            }`}
          >
            {v.label}
            {counts[v.id] > 0 ? (
              <span className="ml-1.5 opacity-70">{counts[v.id]}</span>
            ) : null}
          </Link>
        ))}
      </nav>

      {view === 'all' ? (
        <>
          <Section
            title="Waiting for you"
            rows={pending}
            empty="No new requests."
            jobMap={jobMap}
          />
          <Section
            title="Accepted"
            rows={orderAccepted}
            empty="Nothing accepted right now."
            jobMap={jobMap}
          />
          <Section
            title="Past"
            rows={past}
            empty="No history yet."
            jobMap={jobMap}
            deletable
          />
        </>
      ) : null}

      {view === 'pending' ? (
        <Section
          title="Waiting for you"
          rows={pending}
          empty="No new requests."
          jobMap={jobMap}
        />
      ) : null}

      {view === 'today' ? (
        <Section
          title="Today"
          rows={today}
          empty="Nothing booked for today."
          jobMap={jobMap}
        />
      ) : null}

      {view === 'accepted' ? (
        <Section
          title="Accepted"
          rows={orderAccepted}
          empty="Nothing accepted right now."
          jobMap={jobMap}
        />
      ) : null}

      {view === 'past' ? (
        <Section
          title="Past"
          rows={past}
          empty="No history yet."
          jobMap={jobMap}
          deletable
        />
      ) : null}
    </div>
  )
}

function Section({
  title,
  rows,
  empty,
  jobMap,
  deletable,
}: {
  title: string
  rows: Awaited<ReturnType<typeof fetchBookings>>
  empty: string
  jobMap: Record<string, string>
  deletable?: boolean
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 light:text-slate-500">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-white/10 light:border-slate-200 bg-navy-soft light:bg-white p-4 text-sm text-slate-300 light:text-slate-600">
          {empty}
        </p>
      ) : (
        rows.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            editHref={jobMap[b.id] ? `/dashboard/dispatch/${jobMap[b.id]}` : undefined}
            deletable={deletable}
          />
        ))
      )}
    </section>
  )
}
