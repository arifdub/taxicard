'use client'

import { useState, useTransition } from 'react'
import { setShowPhoto } from './actions'

export default function PhotoToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial)
  const [pending, start] = useTransition()

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-navy-soft px-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-white">Show my photo</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Passengers use it to check they have the right car.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Show my photo on my card"
        disabled={pending}
        onClick={() => {
          const next = !on
          setOn(next)
          start(async () => {
            const res = await setShowPhoto(next)
            if (res?.error) setOn(!next)
          })
        }}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          on ? 'bg-emerald-600' : 'bg-white/25'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
            on ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}
