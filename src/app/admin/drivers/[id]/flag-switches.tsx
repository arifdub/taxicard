'use client'

import { useState, useTransition } from 'react'
import { setDriverFlag, type DriverFlag } from '@/app/admin/actions'

type Row = {
  flag: DriverFlag
  label: string
  on: string
  off: string
}

const ROWS: Row[] = [
  {
    flag: 'is_pro',
    label: 'Pro',
    on: 'Has the pro features.',
    off: 'Standard account.',
  },
  {
    flag: 'is_business',
    label: 'Business',
    on: 'Receives jobs sent by the office.',
    off: 'Does not see office jobs.',
  },
  {
    flag: 'can_dispatch',
    label: 'Office',
    on: 'Can send jobs to business drivers.',
    off: 'Cannot send jobs.',
  },
  {
    flag: 'is_admin',
    label: 'Administrator',
    on: 'Full access to the admin panel.',
    off: 'No admin access.',
  },
]

export default function FlagSwitches({
  driverId,
  isSelf,
  initial,
}: {
  driverId: string
  isSelf: boolean
  initial: Record<DriverFlag, boolean>
}) {
  const [flags, setFlags] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  return (
    <div className="rounded-2xl border border-white/10 bg-navy-soft p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        What this driver can do
      </p>
      <p className="mt-1.5 text-xs text-slate-500">
        Everything is off for a new driver. Turn on only what they need.
      </p>

      {error ? (
        <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4 divide-y divide-white/10">
        {ROWS.map((row) => {
          const on = flags[row.flag]
          const locked = isSelf && row.flag === 'is_admin'

          return (
            <div
              key={row.flag}
              className="flex items-center justify-between gap-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{row.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {locked
                    ? 'This is your own account.'
                    : on
                      ? row.on
                      : row.off}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={row.label}
                disabled={pending || locked}
                onClick={() => {
                  const next = !on
                  setFlags((f) => ({ ...f, [row.flag]: next }))
                  start(async () => {
                    setError(null)
                    const res = await setDriverFlag(driverId, row.flag, next)
                    if (res.error) {
                      setError(res.error)
                      setFlags((f) => ({ ...f, [row.flag]: !next }))
                    }
                  })
                }}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
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
        })}
      </div>
    </div>
  )
}
