'use client'

import { useState, useTransition } from 'react'
import { setDriverPassword } from '@/app/admin/actions'

function suggest() {
  // Readable, easy to say down the phone, still hard to guess.
  const words = ['amber', 'harbour', 'copper', 'meadow', 'lantern', 'quarry',
                 'willow', 'anchor', 'pebble', 'thistle']
  const w = words[Math.floor(Math.random() * words.length)]
  const n = Math.floor(1000 + Math.random() * 9000)
  return `${w}-${n}`
}

export default function PasswordReset({
  driverId,
  driverName,
}: {
  driverId: string
  driverName: string
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
        <p className="text-sm font-semibold text-emerald-200">
          Password set for {driverName.split(' ')[0]}
        </p>
        <p className="mt-2 break-all rounded-xl bg-black/30 px-3 py-2.5 font-mono text-lg text-white">
          {done}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Read it to them, then tell them to change it under Profile. This
          is the only time it is shown.
        </p>
        <button
          onClick={() => {
            setDone(null)
            setOpen(false)
            setValue('')
          }}
          className="mt-3 w-full rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white"
        >
          Done
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true)
          setValue(suggest())
        }}
        className="w-full rounded-2xl border border-white/10 bg-navy-soft px-4 py-3.5 text-sm font-medium text-white"
      >
        Set a temporary password
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-navy-soft p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Temporary password
      </p>
      <p className="mt-2 text-sm text-slate-300">
        For when a reset email will not reach them. They can change it
        afterwards under Profile.
      </p>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-3 w-full rounded-xl border border-white/15 bg-[#0B1425] px-3 py-3 font-mono text-base text-white outline-none focus:border-yellow"
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          disabled={pending || value.length < 8}
          onClick={() =>
            start(async () => {
              setError(null)
              const res = await setDriverPassword(driverId, value)
              if (res.error) setError(res.error)
              else setDone(value)
            })
          }
          className="rounded-xl bg-yellow px-4 py-3 text-sm font-semibold text-navy disabled:opacity-50"
        >
          {pending ? 'Setting…' : 'Set password'}
        </button>
        <button
          onClick={() => {
            setOpen(false)
            setError(null)
          }}
          className="rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
