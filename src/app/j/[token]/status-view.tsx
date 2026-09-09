'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type JobStatus = {
  status: string
  pickup_address: string
  destination_address: string | null
  booking_type: string
  scheduled_at: string | null
  driver_name: string | null
  business_name: string | null
  driver_phone: string | null
  driver_slug: string | null
}

export default function JobStatusView({
  token,
  initial,
}: {
  token: string
  initial: JobStatus
}) {
  const [job, setJob] = useState(initial)

  useEffect(() => {
    if (job.status !== 'OPEN') return
    const supabase = createClient()
    const id = setInterval(async () => {
      const { data } = await supabase.rpc('get_dispatch_job_by_token', {
        p_token: token,
      })
      if (data) setJob(data as JobStatus)
    }, 6000)
    return () => clearInterval(id)
  }, [token, job.status])

  const claimed = job.status === 'CLAIMED'
  const when =
    job.booking_type === 'NOW' || !job.scheduled_at
      ? 'As soon as possible'
      : new Date(job.scheduled_at).toLocaleString(undefined, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })

  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl border px-5 py-6 text-center ${
          claimed
            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
            : job.status === 'OPEN'
              ? 'border-amber-400/30 bg-amber-500/10 text-amber-100'
              : 'border-white/10 bg-white/5 text-slate-200'
        }`}
      >
        <h1 className="text-xl font-semibold">
          {claimed
            ? 'A driver has taken your job'
            : job.status === 'OPEN'
              ? 'Looking for a driver'
              : 'This job is closed'}
        </h1>
        <p className="mt-2 text-sm">
          {claimed
            ? `${job.driver_name} is on the way. Their number is below.`
            : job.status === 'OPEN'
              ? 'Sent to licensed drivers nearby. This page updates on its own.'
              : 'Post a new one if you still need a taxi.'}
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm">
        <Row label="Pickup" value={job.pickup_address} />
        {job.destination_address ? (
          <Row label="Destination" value={job.destination_address} />
        ) : null}
        <Row label="When" value={when} />
        {claimed && job.driver_name ? (
          <Row label="Driver" value={job.business_name ?? job.driver_name} />
        ) : null}
      </div>

      {claimed && job.driver_phone ? (
        <a
          href={`tel:${job.driver_phone.replace(/\s/g, '')}`}
          className="block rounded-2xl bg-yellow px-4 py-4 text-center text-lg font-semibold text-navy"
        >
          Call {job.driver_name?.split(' ')[0]}
        </a>
      ) : null}

      {claimed && job.driver_slug ? (
        <a
          href={`/${job.driver_slug}`}
          className="block rounded-2xl border border-white/15 bg-navy-soft px-4 py-4 text-center text-base font-semibold text-white"
        >
          See {job.driver_name?.split(' ')[0]}&apos;s card
        </a>
      ) : null}

      <p className="text-center text-xs text-slate-500">
        Save this page to check your job later.
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}
