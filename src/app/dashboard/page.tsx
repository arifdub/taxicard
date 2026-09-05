import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchBookings } from '@/lib/bookings'
import { siteUrl, prettyLink } from '@/lib/site'
import BookingCard from '@/components/booking-card'
import { AvailabilitySwitch } from './card/card-tools'
import PushSetup from './push-setup'

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

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-white">
        Hello, {profile?.name?.split(' ')[0] ?? 'driver'}
      </h1>

      <AvailabilitySwitch initial={profile?.is_available ?? true} />

      <PushSetup compact />

      {!profile?.phone ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
          <p className="font-medium text-amber-100">Add your phone number</p>
          <Link
            href="/dashboard/settings"
            className="mt-3 inline-block rounded-xl bg-yellow px-4 py-2.5 text-sm font-semibold text-white"
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
          tone={pending.length > 0 ? 'text-red-300' : undefined}
        />
        <Link href="/dashboard/customers" className="block">
          <Stat value={customerCount} label="Customers" />
        </Link>
        <Stat value={bookingCount} label="Total bookings" />
      </div>

      {pending.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Waiting for you
          </h2>
          {pending.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Today</h2>
          <Link href="/dashboard/bookings" className="text-sm text-brandblue">
            All bookings
          </Link>
        </div>
        {today.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
            Nothing booked for today yet. Share your link and the first one
            will land here.
          </p>
        ) : (
          today.map((b) => <BookingCard key={b.id} booking={b} />)
        )}
      </section>

      <div className="rounded-2xl border border-white/10 bg-navy-soft p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your booking link</p>
        <a
          href={`${siteUrl()}/${profile?.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block break-all text-sm font-medium text-brandblue"
        >
          {prettyLink(profile?.slug ?? '')}
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
    <div className="rounded-2xl border border-white/10 bg-navy-soft p-4">
      <p className={`text-3xl font-semibold ${tone ?? 'text-yellow'}`}>{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-300">{label}</p>
    </div>
  )
}
