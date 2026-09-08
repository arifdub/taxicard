'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { claimDispatchJob } from './actions'

export default function ClaimButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [won, setWon] = useState<{ name: string; phone: string } | null>(null)

  if (won) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
        <p className="text-sm font-semibold text-emerald-200">
          Yours. {won.name} is now one of your customers.
        </p>
        <a
          href={`tel:${won.phone.replace(/\s/g, '')}`}
          className="mt-3 block rounded-xl bg-yellow px-4 py-3 text-center text-sm font-semibold text-navy"
        >
          Call {won.name.split(' ')[0]} on {won.phone}
        </a>
      </div>
    )
  }

  return (
    <>
      {error ? <p className="mb-2 text-sm text-red-300">{error}</p> : null}
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null)
            const res = await claimDispatchJob(id)
            if (res.error) {
              setError(res.error)
              router.refresh()
            } else if (res.customer_name && res.customer_phone) {
              setWon({ name: res.customer_name, phone: res.customer_phone })
            }
          })
        }
        className="w-full rounded-2xl bg-[#16A34A] px-4 py-3.5 text-base font-semibold text-white disabled:opacity-60"
      >
        {pending ? 'Taking it…' : 'Take this job'}
      </button>
    </>
  )
}
