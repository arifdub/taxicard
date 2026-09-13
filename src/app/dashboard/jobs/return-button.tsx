'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { releaseDispatchJob } from './actions'

export default function ReturnButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="mt-3 w-full rounded-2xl border border-white/20 px-4 py-4 text-base font-semibold text-slate-200 transition active:scale-[0.99]"
      >
        Give this job back
      </button>
    )
  }

  return (
    <div className="mt-3">
      {error ? <p className="mb-2 text-sm text-red-300">{error}</p> : null}
      <p className="mb-2 text-sm text-slate-300">
        It goes back to the other drivers, and leaves your bookings.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError(null)
              const res = await releaseDispatchJob(id)
              if (res?.error) setError(res.error)
              else router.refresh()
            })
          }
          className="rounded-xl bg-amber-500 px-4 py-4 text-base font-bold text-navy disabled:opacity-50"
        >
          {pending ? 'Returning…' : 'Give it back'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-xl border border-white/20 px-4 py-4 text-base font-medium text-white"
        >
          Keep it
        </button>
      </div>
    </div>
  )
}
