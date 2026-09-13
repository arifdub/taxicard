import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchBookings, fetchDispatchJobMap } from '@/lib/bookings'
import BookingCard from '@/components/booking-card'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // No date filter on accepted work. A "now" booking is timestamped when
  // it is made, so filtering by a future time hid every job the moment it
  // was accepted — it was neither upcoming nor past.
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

  // "As soon as possible" first, then scheduled work in time order.
  const orderAccepted = [...accepted].sort((a, b) => {
    const aNow = a.booking_type === 'NOW' || !a.scheduled_at
    const bNow = b.booking_type === 'NOW' || !b.scheduled_at
    if (aNow !== bNow) return aNow ? -1 : 1
    if (aNow && bNow) {
      return (
        new Date(b.scheduled_at ?? 0).getTime() -
        new Date(a.scheduled_at ?? 0).getTime()
      )
    }
    return (
      new Date(a.scheduled_at ?? 0).getTime() -
      new Date(b.scheduled_at ?? 0).getTime()
    )
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Bookings</h1>

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
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
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
