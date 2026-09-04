import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchBookings } from '@/lib/bookings'
import BookingCard from '@/components/booking-card'
import { AvailabilitySwitch } from './card/card-tools'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, slug, phone, is_available')
    .eq('id', user.id)
    .single()

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const [pending, today, customerCount, bookingCount] = await Promise.all([
    fetchBookings(supabase, { statuses: ['PENDING'] }),
    fetchBookings(supabase, {
      statuses: ['CONFIRMED', 'ACCEPTED'],
      since: startOfDay.toISOString(),
      until: endOfDay.toISOString(),
    }),
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .then((r) => r.count ?? 0),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .then((r) => r.count ?? 0),
  ])

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
    .replace(/\/$/, '')

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-navy">
        Hello, {profile?.name?.split(' ')[0] ?? 'driver'}
      </h1>

      <AvailabilitySwitch initial={profile?.is_available ?? true} />

      {!profile?.phone ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-medium text-amber-900">Add your phone number</p>
          <Link
            href="/dashboard/settings"
            className="mt-3 inline-block rounded-xl bg-yellow px-4 py-2.5 text-sm font-semibold text-navy"
          >
            Finish setup
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Stat value={today.length} label="Today's bookings" />
        <Stat
          value={pending.length}
          label="Pending requests"
          tone={pending.length > 0 ? 'text-red-600' : undefined}
        />
        <Stat value={customerCount} label="Customers" />
        <Stat value={bookingCount} label="Total bookings" />
      </div>

      {pending.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500">
            Waiting for you
          </h2>
          {pending.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500">Today</h2>
          <Link href="/dashboard/bookings" className="text-sm text-blue-700">
            All bookings
          </Link>
        </div>
        {today.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Nothing booked for today yet. Share your link and the first one
            will land here.
          </p>
        ) : (
          today.map((b) => <BookingCard key={b.id} booking={b} />)
        )}
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold text-slate-500">Your booking link</p>
        <a
          href={`${siteUrl}/${profile?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block break-all text-sm font-medium text-blue-700 underline"
        >
          {siteUrl}/{profile?.slug}
        </a>
      </div>
    </div>
  )
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number
  label: string
  tone?: string
}) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className={`text-2xl font-semibold ${tone ?? 'text-navy'}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
