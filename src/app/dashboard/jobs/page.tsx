import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JobForm from '@/app/admin/dispatch/job-form'
import ClaimButton from './claim-button'

export const dynamic = 'force-dynamic'

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

type SentJob = {
  id: string
  customer_name: string
  customer_phone: string
  pickup_address: string
  pickup_eircode: string | null
  destination_address: string | null
  booking_type: string
  scheduled_at: string | null
  fare: number | null
  status: string
  created_at: string
  taker: { name: string | null; phone: string | null } | null
}

function whenLabel(j: { booking_type: string; scheduled_at: string | null }) {
  return j.booking_type === 'NOW' || !j.scheduled_at
    ? 'As soon as possible'
    : new Date(j.scheduled_at).toLocaleString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
}

const DAY = 24 * 60 * 60 * 1000

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
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

  const isBusiness = Boolean(profile?.is_business)
  const mayDispatch = Boolean(profile?.can_dispatch || profile?.is_admin)

  if (!isBusiness && !mayDispatch) {
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

  const { data: boardData } = isBusiness
    ? await supabase.rpc('list_dispatch_jobs')
    : { data: null }
  const board = (boardData as Job[] | null) ?? []

  const { data: sentData } = mayDispatch
    ? await supabase
        .from('dispatch_jobs')
        .select(
          'id, customer_name, customer_phone, pickup_address, pickup_eircode, destination_address, booking_type, scheduled_at, fare, status, created_at, taker:claimed_by(name, phone)'
        )
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(40)
    : { data: null }
  const sentAll = (sentData as SentJob[] | null) ?? []

  const fresh = (iso: string) => Date.now() - new Date(iso).getTime() < DAY

  const open = board.filter((j) => j.status === 'OPEN')
  const mine = board.filter((j) => j.is_mine && fresh(j.created_at))
  const sent = sentAll.filter((j) => j.status !== 'CANCELLED' && fresh(j.created_at))
  const past = [
    ...board.filter((j) => j.is_mine && !fresh(j.created_at)),
    ...sentAll.filter((j) => j.status === 'CANCELLED' || !fresh(j.created_at)),
  ]

  const TABS = [
    ...(isBusiness
      ? [
          { id: 'open', label: 'Available', count: open.length },
          { id: 'mine', label: 'Mine', count: mine.length },
        ]
      : []),
    ...(mayDispatch ? [{ id: 'sent', label: 'Sent', count: sent.length }] : []),
    { id: 'past', label: 'Past', count: 0 },
    ...(mayDispatch ? [{ id: 'create', label: 'Create job', count: 0 }] : []),
  ]

  const params = await searchParams
  const tab = TABS.find((t) => t.id === params.tab)?.id ?? TABS[0].id

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Jobs</h1>
        <p className="mt-1 text-sm text-slate-400">
          {isBusiness
            ? 'First to take a job gets it, and the customer becomes yours.'
            : 'Jobs you have sent to business drivers.'}
        </p>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/jobs?tab=${t.id}`}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${
              tab === t.id
                ? t.id === 'create'
                  ? 'bg-yellow text-navy'
                  : 'bg-white text-navy'
                : t.id === 'create'
                  ? 'border border-yellow/50 bg-yellow/10 text-yellow'
                  : 'border border-white/15 bg-white/5 text-slate-300'
            }`}
          >
            {t.id === 'create' ? `+ ${t.label}` : t.label}
            {t.count > 0 ? (
              <span className="ml-1.5 opacity-70">{t.count}</span>
            ) : null}
          </Link>
        ))}
      </nav>

      {tab === 'create' ? (
        <section>
          <p className="mb-4 text-sm text-slate-400">
            Goes to every available business driver. The first to take it gets
            the job.
          </p>
          <JobForm />
        </section>
      ) : null}

      {tab === 'open' ? (
        <Board
          rows={open}
          claimable
          empty="Nothing available right now. You will get an alert when a job comes in."
        />
      ) : null}

      {tab === 'mine' ? (
        <Board rows={mine} empty="You have not taken any jobs today." />
      ) : null}

      {tab === 'sent' ? (
        <div className="space-y-3">
          {sent.length === 0 ? (
            <Empty text="You have not sent any jobs recently." />
          ) : (
            sent.map((j) => <SentCard key={j.id} job={j} />)
          )}
        </div>
      ) : null}

      {tab === 'past' ? (
        <div className="space-y-3">
          {past.length === 0 ? (
            <Empty text="Nothing here yet." />
          ) : (
            past.map((j) =>
              'is_mine' in j ? (
                <JobCard key={j.id} job={j as Job} />
              ) : (
                <SentCard key={j.id} job={j as SentJob} />
              )
            )
          )}
        </div>
      ) : null}

      {tab === 'open' ? (
        <p className="text-xs text-slate-500">
          Numbers are hidden until you take the job.
        </p>
      ) : null}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
      {text}
    </p>
  )
}

function Board({
  rows,
  claimable,
  empty,
}: {
  rows: Job[]
  claimable?: boolean
  empty: string
}) {
  if (rows.length === 0) return <Empty text={empty} />
  return (
    <div className="space-y-3">
      {rows.map((j) => (
        <JobCard key={j.id} job={j} claimable={claimable} />
      ))}
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
        <p className="text-slate-400">{whenLabel(job)}</p>
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
            {job.status === 'CLAIMED' ? 'assigned' : job.status.toLowerCase()}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-1 rounded-xl bg-white/5 p-3 text-sm text-slate-200">
        <p>{job.pickup_address}</p>
        {job.destination_address ? (
          <p className="text-slate-300">to {job.destination_address}</p>
        ) : null}
        <p className="text-slate-400">{whenLabel(job)}</p>
      </div>

      <p className="mt-2 text-xs">
        {job.taker?.name ? (
          <span className="text-emerald-300">
            Taken by {job.taker.name}
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
