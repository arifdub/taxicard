'use client'

import { useState, useTransition } from 'react'
import PasswordReset from './password-reset'
import FlagSwitches from './flag-switches'
import { setDriverActive, deleteDriver } from '@/app/admin/actions'

export default function DriverControls({
  driverId,
  driverName,
  isActive,
  isAdmin,
  isSelf,
  canDispatch,
  isPro,
  isBusiness,
}: {
  driverId: string
  driverName: string
  isActive: boolean
  isAdmin: boolean
  isSelf: boolean
  canDispatch: boolean
  isPro: boolean
  isBusiness: boolean
}) {
  const [active, setActive] = useState(isActive)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [typed, setTyped] = useState('')

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

      <FlagSwitches
        driverId={driverId}
        isSelf={isSelf}
        initial={{
          is_pro: isPro,
          is_business: isBusiness,
          can_dispatch: canDispatch,
          is_admin: isAdmin,
        }}
      />

      <div className="rounded-2xl border border-red-400/30 bg-red-500/5 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-300">
          Delete
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Removes the account and everything with it — their card, their
          customers, their bookings. Cannot be undone. Disabling is almost
          always the better choice.
        </p>

        {!deleting ? (
          <button
            onClick={() => setDeleting(true)}
            className="mt-4 w-full rounded-xl border border-red-400/40 px-4 py-3 text-sm font-semibold text-red-300"
          >
            Delete this driver
          </button>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-sm text-slate-300">
              Type <span className="font-semibold text-white">DELETE</span> to
              confirm
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/15 bg-navy-soft px-3 py-3 text-base text-white outline-none focus:border-red-400"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={pending || typed !== 'DELETE'}
                onClick={() =>
                  start(async () => {
                    setError(null)
                    const res = await deleteDriver(driverId)
                    if (res.error) setError(res.error)
                    else window.location.href = '/admin/drivers'
                  })
                }
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {pending ? 'Deleting…' : `Delete ${driverName.split(' ')[0]}`}
              </button>
              <button
                onClick={() => {
                  setDeleting(false)
                  setTyped('')
                }}
                className="rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white"
              >
                Keep
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
