import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JobForm, { type JobDefaults } from '@/app/admin/dispatch/job-form'

export const dynamic = 'force-dynamic'

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.rpc('get_dispatch_job', { p_id: id })
  const job = data as (JobDefaults & { status: string; claimed_by: string | null }) | null

  if (!job) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/dispatch" className="text-sm text-slate-400">
          Back to jobs
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-white">Edit job</h1>
        <p className="mt-1 text-sm text-slate-400">
          {job.status === 'CLAIMED'
            ? 'A driver has taken this one. Saving updates their booking and sends them an alert.'
            : 'Not taken yet. Changes appear to drivers straight away.'}
        </p>
      </div>

      {job.status === 'CANCELLED' ? (
        <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
          This job was cancelled and cannot be edited.
        </p>
      ) : (
        <JobForm job={job} />
      )}
    </div>
  )
}
