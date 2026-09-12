'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteBooking } from './actions'

export default function DeleteBooking({ id }: { id: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="mt-3 text-sm text-slate-500 underline"
      >
        Delete
      </button>
    )
  }

  return (
    <div className="mt-3">
      {error ? <p className="mb-2 text-sm text-red-300">{error}</p> : null}
      <p className="mb-2 text-sm text-slate-300">
        Delete this booking? The customer record stays.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await deleteBooking(id)
              if (res?.error) setError(res.error)
              else router.refresh()
            })
          }
          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? 'Deleting…' : 'Delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white"
        >
          Keep
        </button>
      </div>
    </div>
  )
}
