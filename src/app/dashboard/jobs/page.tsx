import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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
    .select('plan')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.plan !== 'BUSINESS') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Jobs</h1>
        <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
          Jobs sent by the office go to drivers on the business plan. Get in
          touch if you would like to be added.
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
          Sent by the office. First to take it gets it, and the customer
          becomes yours.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Available now
        </h2>
        {open.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
            Nothing available right now.
          </p>
        ) : (
          open.map((j) => <JobCard key={j.id} job={j} claimable />)
        )}
      </section>

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
        <span className="shrink-0 text-xs text-slate-500">
          {new Date(job.created_at).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
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
