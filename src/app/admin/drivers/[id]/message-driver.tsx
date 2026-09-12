'use client'

import { useActionState, useState } from 'react'
import { messageDriver, type DirectState } from '@/app/admin/messages/actions'

const initial: DirectState = {}
const field =
  'w-full rounded-xl border border-white/10 bg-[#0B1425] px-3 py-3 text-base text-white outline-none focus:border-yellow'

export default function MessageDriver({
  driverId,
  driverName,
}: {
  driverId: string
  driverName: string
}) {
  const [open, setOpen] = useState(false)
  const bound = messageDriver.bind(null, driverId)
  const [state, action, pending] = useActionState(bound, initial)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-white/10 bg-navy-soft px-4 py-3.5 text-sm font-medium text-white"
      >
        Send {driverName.split(' ')[0]} a message
      </button>
    )
  }

  return (
    <form
      action={action}
      className="space-y-3 rounded-2xl border border-white/10 bg-navy-soft p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Message {driverName.split(' ')[0]}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-slate-400"
        >
          Close
        </button>
      </div>

      {state.error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
          {state.message}
        </p>
      ) : null}

      <input
        name="title"
        required
        maxLength={80}
        placeholder="Subject"
        className={field}
      />
      <textarea
        name="body"
        rows={3}
        maxLength={600}
        placeholder="Message (optional)"
        className={field}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-yellow px-4 py-3 text-sm font-semibold text-navy disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>

      <p className="text-center text-xs text-slate-500">
        Only this driver sees it, in their notifications and as a push alert.
      </p>
    </form>
  )
}
