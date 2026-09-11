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
    fetchBookings(supabase, { statuses: ['PENDING'] }),
    fetchBookings(supabase, { statuses: ['CONFIRMED', 'ACCEPTED'] }),
    fetchBookings(supabase, {
      statuses: ['COMPLETED', 'DECLINED', 'CANCELLED'],
      limit: 30,
      newestFirst: true,
    }),
  ])

  const { data: me } = await supabase
    .from('profiles')
    .select('can_dispatch, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  const jobMap =
    me?.can_dispatch || me?.is_admin
      ? await fetchDispatchJobMap(
          supabase,
          [...pending, ...accepted, ...past].map((b) => b.id)
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
        rows={accepted}
        empty="Nothing accepted right now."
        jobMap={jobMap}
      />
      <Section
        title="Past"
        rows={past}
        empty="No history yet."
        jobMap={jobMap}
      />
    </div>
  )
}

function Section({
  title,
  rows,
  empty,
  jobMap,
}: {
  title: string
  rows: Awaited<ReturnType<typeof fetchBookings>>
  empty: string
  jobMap: Record<string, string>
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
          />
        ))
      )}
    </section>
  )
}
