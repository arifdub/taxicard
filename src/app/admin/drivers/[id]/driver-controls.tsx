'use client'

import { useState, useTransition } from 'react'
import { setDriverActive, setDriverPlan } from '@/app/admin/actions'

const PLANS = ['FREE', 'PRO', 'BUSINESS'] as const

export default function DriverControls({
  driverId,
  isActive,
  plan,
}: {
  driverId: string
  isActive: boolean
  plan: string
}) {
  const [active, setActive] = useState(isActive)
  const [current, setCurrent] = useState(plan)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function toggleActive() {
    setError(null)
    const next = !active
    start(async () => {
      const res = await setDriverActive(driverId, next)
      if (res.error) setError(res.error)
      else {
        setActive(next)
        setConfirming(false)
      }
    })
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-navy-soft p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Plan
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {PLANS.map((p) => (
            <button
              key={p}
              disabled={pending}
              onClick={() => {
                setError(null)
                start(async () => {
                  const res = await setDriverPlan(driverId, p)
                  if (res.error) setError(res.error)
                  else setCurrent(p)
                })
              }}
              className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                current === p
                  ? 'bg-yellow text-navy'
                  : 'border border-white/15 text-slate-300'
              }`}
            >
              {p.toLowerCase()}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Nothing is billed yet. This only records which plan they are on.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-navy-soft p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Account
        </p>
        <p className="mt-2 text-sm text-slate-300">
          {active
            ? 'Active. Their card is live and takes bookings.'
            : 'Disabled. Their card returns a not-found page and no booking can be made.'}
        </p>

        {!confirming ? (
          <button
            onClick={() => (active ? setConfirming(true) : toggleActive())}
            disabled={pending}
            className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-semibold ${
              active
                ? 'border border-red-400/40 text-red-300'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {active ? 'Disable this driver' : 'Re-enable this driver'}
          </button>
        ) : (
          <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-100">
              Disable this driver? Their public card stops working
              immediately. Their data is kept and you can re-enable them.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={toggleActive}
                disabled={pending}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
              >
                {pending ? 'Working…' : 'Yes, disable'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-xl border border-white/20 px-4 py-3 text-sm font-medium"
              >
                Keep active
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
