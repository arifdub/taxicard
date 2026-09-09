import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JobStatusView, { type JobStatus } from './status-view'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Your job',
  robots: { index: false, follow: false },
}

export default async function JobStatusPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_dispatch_job_by_token', {
    p_token: token,
  })

  const job = (data as JobStatus | null) ?? null
  if (!job) notFound()

  return (
    <main className="tc-dark-page w-full px-5 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)] text-white">
      <div className="mx-auto w-full max-w-md">
        <JobStatusView token={token} initial={job} />
      </div>
    </main>
  )
}
