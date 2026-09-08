import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import JobForm from './job-form'

export const dynamic = 'force-dynamic'

type Job = {
  id: string
  customer_name: string
  customer_phone: string
  pickup_address: string
  destination_address: string | null
  booking_type: string
  scheduled_at: string | null
  status: string
  claimed_at: string | null
  created_at: string
  claimed_by: string | null
}

export default async function DispatchPage() {
  const { supabase } = await requireAdmin()

  const { data } = await supabase
    .from('dispatch_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(40)

  const jobs = (data as Job[] | null) ?? []

  const { count: businessCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('plan', 'BUSINESS')
    .eq('is_active', true)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Send a job</h1>
        <p className="mt-1 text-sm text-slate-400">
          {businessCount ?? 0} driver{businessCount === 1 ? '' : 's'} on the
          business plan will see it.{' '}
          <Link href="/admin/drivers" className="text-brandblue">
            Manage plans
          </Link>
        </p>
      </div>

      <JobForm />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Recent jobs
        </h2>

        {jobs.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
            Nothing sent yet.
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
                    <p className="text-sm text-slate-400">{j.customer_phone}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      j.status === 'CLAIMED'
                        ? 'bg-emerald-400/20 text-emerald-200'
                        : j.status === 'OPEN'
                          ? 'bg-amber-400/20 text-amber-200'
                          : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {j.status.toLowerCase()}
                  </span>
                </div>

                <div className="mt-3 space-y-1 rounded-xl bg-white/5 p-3 text-sm text-slate-200">
                  <p>{j.pickup_address}</p>
                  {j.destination_address ? (
                    <p className="text-slate-300">to {j.destination_address}</p>
                  ) : null}
                  <p className="text-slate-400">
                    {j.booking_type === 'NOW' || !j.scheduled_at
                      ? 'As soon as possible'
                      : new Date(j.scheduled_at).toLocaleString(undefined, {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                  </p>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Sent{' '}
                  {new Date(j.created_at).toLocaleString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {j.claimed_at
                    ? ` · taken ${new Date(j.claimed_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
                    : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
