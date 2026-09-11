import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import JobForm from './job-form'

export const dynamic = 'force-dynamic'

type Person = {
  name: string | null
  licence_number: string | null
  phone: string | null
} | null

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
  status: string
  source: string
  fare: number | null
  claimed_at: string | null
  created_at: string
  creator: Person
  taker: Person
}

const TABS = [
  { id: 'open', label: 'Waiting' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'all', label: 'All' },
  { id: 'new', label: 'Create job' },
] as const

type Tab = (typeof TABS)[number]['id']

function when(j: Job) {
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

function stamp(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function DispatchPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { supabase } = await requireAdmin()
  const params = await searchParams
  const tab: Tab = (TABS.find((t) => t.id === params.status)?.id ?? 'open') as Tab
  const creating = tab === 'new'

  const SELECT =
    '*, creator:created_by(name, licence_number, phone), taker:claimed_by(name, licence_number, phone)'

  let jobs: Job[] = []
  if (!creating) {
    let q = supabase.from('dispatch_jobs').select(SELECT)
    if (tab === 'open') q = q.eq('status', 'OPEN')
    if (tab === 'assigned') q = q.eq('status', 'CLAIMED')
    if (tab === 'cancelled') q = q.eq('status', 'CANCELLED')

    const { data } = await q.order('created_at', { ascending: false }).limit(60)
    jobs = (data as Job[] | null) ?? []
  }

  const [openCount, assignedCount, businessCount] = await Promise.all([
    supabase
      .from('dispatch_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'OPEN')
      .then((r) => r.count ?? 0),
    supabase
      .from('dispatch_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'CLAIMED')
      .then((r) => r.count ?? 0),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('plan', 'BUSINESS')
      .eq('is_active', true)
      .then((r) => r.count ?? 0),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Dispatch</h1>
        <p className="mt-1 text-sm text-slate-400">
          Every job on the platform — sent by the office, by a dispatcher, or
          posted by a passenger from the website.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat value={openCount} label="Waiting" tone="text-amber-300" />
        <Stat value={assignedCount} label="Assigned" tone="text-emerald-300" />
        <Stat value={businessCount} label="Business drivers" />
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/dispatch?status=${t.id}`}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${
              tab === t.id
                ? t.id === 'new'
                  ? 'bg-yellow text-navy'
                  : 'bg-white text-navy'
                : t.id === 'new'
                  ? 'border border-yellow/50 bg-yellow/10 text-yellow'
                  : 'border border-white/15 bg-white/5 text-slate-300'
            }`}
          >
            {t.id === 'new' ? `+ ${t.label}` : t.label}
            {t.id === 'open' && openCount > 0 ? (
              <span className="ml-1.5 opacity-70">{openCount}</span>
            ) : null}
          </Link>
        ))}
      </nav>

      {creating ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Send a new job
          </h2>
          <p className="mb-4 mt-1 text-sm text-slate-400">
            Goes to {businessCount} business driver
            {businessCount === 1 ? '' : 's'}. First to take it gets it.
          </p>
          <JobForm />
        </section>
      ) : (
      <section>
        {jobs.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
            Nothing here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {jobs.map((j) => (
              <li
                key={j.id}
                className="rounded-2xl border border-white/10 bg-navy-soft p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{j.customer_name}</p>
                    <a
                      href={`tel:${j.customer_phone.replace(/\s/g, '')}`}
                      className="text-sm text-brandblue"
                    >
                      {j.customer_phone}
                    </a>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {j.fare != null ? (
                      <span className="rounded-lg bg-yellow px-2 py-1 text-sm font-bold text-navy">
                        &euro;{Number(j.fare).toFixed(2)}
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        j.status === 'CLAIMED'
                          ? 'bg-emerald-400/20 text-emerald-200'
                          : j.status === 'OPEN'
                            ? 'bg-amber-400/20 text-amber-200'
                            : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {j.status === 'CLAIMED' ? 'assigned' : j.status.toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 rounded-xl bg-white/5 p-3 text-sm text-slate-200">
                  <p>
                    {j.pickup_address}
                    {j.pickup_eircode ? (
                      <span className="ml-2 rounded-md bg-yellow/15 px-1.5 py-0.5 text-xs font-semibold text-yellow">
                        {j.pickup_eircode}
                      </span>
                    ) : null}
                  </p>
                  {j.destination_address ? (
                    <p className="text-slate-300">to {j.destination_address}</p>
                  ) : null}
                  <p className="text-slate-400">{when(j)}</p>
                  {j.notes ? <p className="text-slate-400">{j.notes}</p> : null}
                </div>

                {j.taker ? (
                  <div className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                      Assigned to
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {j.taker.name ?? 'Driver'}
                      {j.taker.licence_number
                        ? ` · licence ${j.taker.licence_number}`
                        : ''}
                    </p>
                    {j.taker.phone ? (
                      <a
                        href={`tel:${j.taker.phone.replace(/\s/g, '')}`}
                        className="text-sm text-brandblue"
                      >
                        {j.taker.phone}
                      </a>
                    ) : null}
                    {j.claimed_at ? (
                      <p className="mt-1 text-xs text-slate-400">
                        Taken {stamp(j.claimed_at)}
                      </p>
                    ) : null}
                  </div>
                ) : j.status === 'OPEN' ? (
                  <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                    Waiting for a driver to take it.
                  </p>
                ) : null}

                {j.status !== 'CANCELLED' ? (
                  <Link
                    href={`/dashboard/dispatch/${j.id}`}
                    className="mt-3 block rounded-xl bg-yellow px-4 py-3 text-center text-sm font-bold text-navy"
                  >
                    Edit job{j.taker ? ' and tell the driver' : ''}
                  </Link>
                ) : null}

                <p className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Sent by</span>{' '}
                  {j.source === 'PUBLIC' ? (
                    <span className="font-semibold text-brandblue">
                      a passenger, from the website
                    </span>
                  ) : (
                    <>
                      {j.creator?.name ?? 'Unknown'}
                      {j.creator?.licence_number
                        ? ` · licence ${j.creator.licence_number}`
                        : ''}
                      {' · back office'}
                    </>
                  )}{' '}
                  · {stamp(j.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      )}
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
      <p className={`text-2xl font-semibold ${tone ?? 'text-white'}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  )
}
