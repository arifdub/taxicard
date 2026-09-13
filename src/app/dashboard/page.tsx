import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchBookings, fetchDispatchJobMap } from '@/lib/bookings'
import { siteUrl, prettyLink } from '@/lib/site'
import BookingCard from '@/components/booking-card'
import { OnlineCard, NotificationsCard } from './status-cards'
import InstallPrompt from './install-prompt'

export const dynamic = 'force-dynamic'

function Stat({
  value,
  label,
  hint,
  icon,
  tone,
}: {
  value: number
  label: string
  hint: string
  icon: React.ReactNode
  tone: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-soft p-4">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${tone}`}
      >
        {icon}
      </span>
      <p className="mt-3 text-[28px] font-bold leading-none text-yellow">
        {value}
      </p>
      <p className="mt-1.5 text-[15px] font-semibold text-white">{label}</p>
      <p className="mt-0.5 text-[12px] leading-snug text-slate-400">{hint}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, slug, phone, is_available, can_dispatch, is_admin')
    .eq('id', user.id)
    .single()

  const mayEditJobs = Boolean(profile?.can_dispatch || profile?.is_admin)

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const [pending, today, customerCount, bookingCount] = await Promise.all([
    fetchBookings(supabase, { driverId: user.id, statuses: ['PENDING'] }),
    fetchBookings(supabase, {
      driverId: user.id,
      statuses: ['CONFIRMED', 'ACCEPTED'],
      since: startOfDay.toISOString(),
      until: endOfDay.toISOString(),
    }),
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('driver_id', user.id)
      .then((r) => r.count ?? 0),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('driver_id', user.id)
      .then((r) => r.count ?? 0),
  ])

  const jobMap = mayEditJobs
    ? await fetchDispatchJobMap(supabase, [...pending, ...today].map((b) => b.id))
    : {}

  const first = (profile?.name ?? 'there').split(' ')[0]
  const url = `${siteUrl()}/${profile?.slug ?? ''}`

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[30px] font-bold leading-tight text-white">
          Hello, <span className="text-yellow">{first}</span>
        </h1>
        <p className="mt-1 text-[15px] text-slate-400">
          Have a safe and successful day.
        </p>
      </div>

      <OnlineCard initial={Boolean(profile?.is_available)} />
      <NotificationsCard />
      <InstallPrompt />

      <div className="grid grid-cols-2 gap-3">
        <Stat
          value={today.length}
          label="Today's bookings"
          hint="Accepted for today"
          tone="bg-brandblue/15 text-brandblue"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="3.2" y="5" width="17.6" height="16" rx="2.4" />
              <path d="M3.2 9.6h17.6M8 3.2v3.4M16 3.2v3.4" strokeLinecap="round" />
            </svg>
          }
        />
        <Stat
          value={pending.length}
          label="Pending requests"
          hint="Awaiting your response"
          tone="bg-yellow/15 text-yellow"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="8.6" />
              <path d="M12 7.2V12l3.2 2" strokeLinecap="round" />
            </svg>
          }
        />
        <Stat
          value={customerCount}
          label="Customers"
          hint="Your regular passengers"
          tone="bg-emerald-500/15 text-emerald-300"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="9" cy="8.4" r="3.4" />
              <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0z" />
              <circle cx="17" cy="9.4" r="2.6" />
              <path d="M14.4 20a5 5 0 0 1 6.8-4.7V20z" />
            </svg>
          }
        />
        <Stat
          value={bookingCount}
          label="Total bookings"
          hint="All time"
          tone="bg-indigo-500/20 text-indigo-300"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="4" y="12" width="3.6" height="8" rx="1" />
              <rect x="10.2" y="8" width="3.6" height="12" rx="1" />
              <rect x="16.4" y="4" width="3.6" height="16" rx="1" />
            </svg>
          }
        />
      </div>

      {pending.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-[15px] font-bold text-white">
            Waiting for you
          </h2>
          {pending.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              editHref={jobMap[b.id] ? `/dashboard/dispatch/${jobMap[b.id]}` : undefined}
            />
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-white">Today</h2>
          <Link
            href="/dashboard/bookings"
            className="flex items-center gap-1 text-sm font-semibold text-yellow"
          >
            View all bookings
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="M9 5.5 15.5 12 9 18.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {today.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-navy-soft px-5 py-8 text-center">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="mx-auto text-slate-500"
              aria-hidden="true"
            >
              <rect x="3.2" y="5" width="17.6" height="16" rx="2.4" />
              <path d="M3.2 9.6h17.6M8 3.2v3.4M16 3.2v3.4" strokeLinecap="round" />
            </svg>
            <p className="mt-3 text-[16px] font-semibold text-white">
              No bookings for today yet
            </p>
            <p className="mt-1 text-sm text-slate-400">
              When a booking arrives, it will appear here.
            </p>
          </div>
        ) : (
          today.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              editHref={jobMap[b.id] ? `/dashboard/dispatch/${jobMap[b.id]}` : undefined}
            />
          ))
        )}
      </section>

      <div className="rounded-2xl border border-white/10 bg-navy-soft p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Your booking link
        </p>
        <Link
          href={`/${profile?.slug ?? ''}`}
          className="mt-1 block break-all text-sm font-medium text-brandblue"
        >
          {prettyLink(profile?.slug ?? '')}
        </Link>
        <p className="mt-1 text-xs text-slate-500">{url}</p>
      </div>
    </div>
  )
}
