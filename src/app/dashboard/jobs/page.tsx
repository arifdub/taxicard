import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClaimButton from './claim-button'

export const dynamic = 'force-dynamic'

type SentJob = {
  id: string
  customer_name: string
  customer_phone: string
  pickup_address: string
  destination_address: string | null
  booking_type: string
  scheduled_at: string | null
  fare: number | null
  status: string
  created_at: string
  taker: { name: string | null; phone: string | null } | null
}

type Job = {
  id: string
  customer_name: string
  customer_phone: string
  pickup_address: string
  pickup_eircode: string | null
  destination_address: string | null
  booking_type: string
  scheduled_at: string | null
  notes: string | null
  fare: number | null
  status: string
  is_mine: boolean
  created_at: string
}

export default async function JobsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_business, can_dispatch, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  const mayDispatch = Boolean(profile?.can_dispatch || profile?.is_admin)

  // Jobs this person sent out, whoever ends up taking them.
  const { data: sentRows } = mayDispatch
    ? await supabase
        .from('dispatch_jobs')
        .select(
          'id, customer_name, customer_phone, pickup_address, destination_address, booking_type, scheduled_at, fare, status, created_at, taker:claimed_by(name, phone)'
        )
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: null }

  const sent = (sentRows as SentJob[] | null) ?? []

  if (!profile?.is_business && !mayDispatch) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Jobs</h1>
        <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
          Office jobs go to business drivers. Get in touch if you would like
          your account switched on for them.
        </p>
      </div>
    )
  }

  const { data } = await supabase.rpc('list_dispatch_jobs')
  const jobs = (data as Job[] | null) ?? []
  const open = jobs.filter((j) => j.status === 'OPEN')
  const mine = jobs.filter((j) => j.is_mine)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Jobs</h1>
        <p className="mt-1 text-sm text-slate-400">
          {profile?.is_business
            ? 'First to take it gets it, and the customer becomes yours.'
            : 'Jobs you have sent out to business drivers.'}
        </p>
      </div>

      {profile?.is_business ? (
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Available to take
        </h2>
        {open.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
            Nothing available right now.
          </p>
        ) : (
          open.map((j) => <JobCard key={j.id} job={j} claimable />)
        )}
      </section>
      ) : null}

      {mine.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Taken by you
          </h2>
          {mine.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </section>
      ) : null}

      {mayDispatch ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Sent by you
          </h2>
          {sent.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
              You have not sent any jobs yet.
            </p>
          ) : (
            sent.map((j) => <SentCard key={j.id} job={j} />)
          )}
        </section>
      ) : null}

      <p className="text-xs text-slate-500">
        Numbers are hidden until you take the job.
      </p>
    </div>
  )
}

function JobCard({ job, claimable }: { job: Job; claimable?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-white">
            {job.customer_name}
          </p>
          {job.is_mine ? (
            <a
              href={`tel:${job.customer_phone.replace(/\s/g, '')}`}
              className="text-sm font-medium text-brandblue"
            >
              {job.customer_phone}
            </a>
          ) : (
            <p className="text-sm text-slate-400">{job.customer_phone}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          {job.fare != null ? (
            <span className="block rounded-lg bg-yellow px-2.5 py-1 text-base font-bold text-navy">
              &euro;{Number(job.fare).toFixed(2)}
            </span>
          ) : null}
          <span className="mt-1 block text-xs text-slate-500">
            {new Date(job.created_at).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-1 rounded-xl bg-white/5 p-3 text-sm text-slate-200">
        <p>
          {job.pickup_address}
          {job.pickup_eircode ? (
            <span className="ml-2 rounded-md bg-yellow/15 px-1.5 py-0.5 text-xs font-semibold text-yellow">
              {job.pickup_eircode}
            </span>
          ) : null}
        </p>
        {job.destination_address ? (
          <p className="text-slate-300">to {job.destination_address}</p>
        ) : null}
        <p className="text-slate-400">
          {job.booking_type === 'NOW' || !job.scheduled_at
            ? 'As soon as possible'
            : new Date(job.scheduled_at).toLocaleString(undefined, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
        </p>
        {job.notes ? <p className="text-slate-400">{job.notes}</p> : null}
      </div>

      {claimable ? (
        <div className="mt-3">
          <ClaimButton id={job.id} />
        </div>
      ) : null}
    </div>
  )
}

function SentCard({ job }: { job: SentJob }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-white">
            {job.customer_name}
          </p>
          <p className="text-sm text-slate-400">{job.customer_phone}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {job.fare != null ? (
            <span className="rounded-lg bg-yellow px-2 py-1 text-sm font-bold text-navy">
              &euro;{Number(job.fare).toFixed(2)}
            </span>
          ) : null}
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              job.status === 'CLAIMED'
                ? 'bg-emerald-400/20 text-emerald-200'
                : job.status === 'OPEN'
                  ? 'bg-amber-400/20 text-amber-200'
                  : 'bg-white/10 text-slate-300'
            }`}
          >
            {job.status.toLowerCase()}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-1 rounded-xl bg-white/5 p-3 text-sm text-slate-200">
        <p>{job.pickup_address}</p>
        {job.destination_address ? (
          <p className="text-slate-300">to {job.destination_address}</p>
        ) : null}
        <p className="text-slate-400">
          {job.booking_type === 'NOW' || !job.scheduled_at
            ? 'As soon as possible'
            : new Date(job.scheduled_at).toLocaleString(undefined, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
        </p>
      </div>

      <p className="mt-2 text-xs">
        {job.taker?.name ? (
          <span className="text-emerald-300">
            Accepted by {job.taker.name}
            {job.taker.phone ? ` · ${job.taker.phone}` : ''}
          </span>
        ) : (
          <span className="text-amber-300">Not taken yet</span>
        )}
      </p>

      {job.status !== 'CANCELLED' ? (
        <Link
          href={`/dashboard/dispatch/${job.id}`}
          className="mt-3 block rounded-xl border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-white"
        >
          Edit job
        </Link>
      ) : null}
    </div>
  )
}
