import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchBookings } from '@/lib/bookings'
import BookingCard from '@/components/booking-card'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date().toISOString()

  const [pending, upcoming, past] = await Promise.all([
    fetchBookings(supabase, { statuses: ['PENDING'] }),
    fetchBookings(supabase, {
      statuses: ['CONFIRMED', 'ACCEPTED'],
      since: now,
    }),
    fetchBookings(supabase, {
      statuses: ['COMPLETED', 'DECLINED', 'CANCELLED'],
      limit: 30,
    }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Bookings</h1>

      <Section title="Waiting for you" rows={pending} empty="No new requests." />
      <Section title="Upcoming" rows={upcoming} empty="Nothing booked ahead." />
      <Section title="Past" rows={past.reverse()} empty="No history yet." />
    </div>
  )
}

function Section({
  title,
  rows,
  empty,
}: {
  title: string
  rows: Awaited<ReturnType<typeof fetchBookings>>
  empty: string
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-400">{title}</h2>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-400">
          {empty}
        </p>
      ) : (
        rows.map((b) => <BookingCard key={b.id} booking={b} />)
      )}
    </section>
  )
}
