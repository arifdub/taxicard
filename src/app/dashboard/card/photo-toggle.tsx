'use client'

import { useState, useTransition } from 'react'
import { setShowPhoto, setShowPhone } from './actions'

type Kind = 'photo' | 'phone'

const COPY: Record<Kind, { label: string; hint: string }> = {
  photo: {
    label: 'Show my photo',
    hint: 'Passengers use it to check they have the right car.',
  },
  phone: {
    label: 'Show my phone number',
    hint: 'Turn off to leave only the booking button on your card.',
  },
}

export default function CardToggle({
  kind,
  initial,
}: {
  kind: Kind
  initial: boolean
}) {
  const [on, setOn] = useState(initial)
  const [pending, start] = useTransition()
  const copy = COPY[kind]

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-navy-soft px-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-white">{copy.label}</p>
        <p className="mt-0.5 text-xs text-slate-400">{copy.hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={copy.label}
        disabled={pending}
        onClick={() => {
          const next = !on
          setOn(next)
          start(async () => {
            const res =
              kind === 'photo'
                ? await setShowPhoto(next)
                : await setShowPhone(next)
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
