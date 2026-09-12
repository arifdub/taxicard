'use client'

import { useActionState, useState } from 'react'
import { sendBroadcast, type MessageState } from './actions'

const initial: MessageState = {}
const field =
  'w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3.5 text-base text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15'
const label = 'mb-1 block text-xs font-semibold text-slate-400'

const AUDIENCES = [
  { id: 'ALL', label: 'All drivers' },
  { id: 'BUSINESS', label: 'Business only' },
  { id: 'PRO', label: 'Pro only' },
] as const

export default function MessageForm() {
  const [state, action, pending] = useActionState(sendBroadcast, initial)
  const [audience, setAudience] = useState<string>('ALL')

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="audience" value={audience} />

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

      <div>
        <label htmlFor="title" className={label}>
          Subject
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={80}
          placeholder="Airport road closed tonight"
          className={field}
        />
      </div>

      <div>
        <label htmlFor="body" className={label}>
          Message (optional)
        </label>
        <textarea
          id="body"
          name="body"
          rows={4}
          maxLength={600}
          placeholder="Use the tunnel instead until about 11pm."
          className={field}
        />
      </div>

      <div>
        <span className={label}>Who gets it</span>
        <div className="grid grid-cols-3 gap-2">
          {AUDIENCES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAudience(a.id)}
              className={`rounded-xl px-3 py-3 text-sm font-medium ${
                audience === a.id
                  ? 'bg-yellow text-navy'
                  : 'border border-white/15 bg-navy-soft text-slate-200'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-yellow px-4 py-4 text-lg font-semibold text-navy disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>

      <p className="text-center text-xs text-slate-500">
        Appears in their notifications and as a push alert on their phone.
      </p>
    </form>
  )
}
