import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JobForm from '@/app/admin/dispatch/job-form'

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
  fare: number | null
  claimed_at: string | null
  created_at: string
}

/**
 * The office view. Same form as the admin one, for staff who can send
 * jobs but should not be able to disable or delete drivers.
 */
export default async function OfficeDispatchPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('profiles')
    .select('can_dispatch, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!me?.can_dispatch && !me?.is_admin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Send a job</h1>
        <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
          You do not have permission to send jobs. Ask an administrator to
          turn it on for your account.
        </p>
      </div>
    )
  }

  const { data } = await supabase
    .from('dispatch_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  const jobs = (data as Job[] | null) ?? []

  const { count: businessCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('plan', 'BUSINESS')
    .eq('is_active', true)

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-semibold text-white">Send a job</h1>
        <p className="mt-1 text-sm text-slate-400">
          Goes to {businessCount ?? 0} business driver
          {businessCount === 1 ? '' : 's'}. First to take it gets it.
        </p>
      </div>

      <JobForm />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Recent jobs
        </h2>

        {jobs.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
            Nothing sent yet.
          </p>
        ) : (
          jobs.map((j) => (
            <div
              key={j.id}
              className="rounded-2xl border border-white/10 bg-navy-soft p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{j.customer_name}</p>
                  <p className="text-sm text-slate-400">{j.customer_phone}</p>
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
                    {j.status.toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1 rounded-xl bg-white/5 p-3 text-sm text-slate-200">
                <p>{j.pickup_address}</p>
                {j.destination_address ? (
                  <p className="text-slate-300">to {j.destination_address}</p>
                ) : null}
              </div>

              {j.status !== 'CANCELLED' ? (
                <Link
                  href={`/dashboard/dispatch/${j.id}`}
                  className="mt-3 block rounded-xl border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Edit job
                </Link>
              ) : null}
            </div>
          ))
        )}
      </section>

      <Link href="/dashboard" className="block text-sm text-brandblue">
        Back to dashboard
      </Link>
    </div>
  )
}
