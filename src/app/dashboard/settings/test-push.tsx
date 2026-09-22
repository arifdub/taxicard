'use client'

import { useState, useTransition } from 'react'
import { sendTestPush, type TestState } from './test-push-actions'

export default function TestPush() {
  const [state, setState] = useState<TestState>({})
  const [pending, start] = useTransition()

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setState({})
            setState(await sendTestPush())
          })
        }
        className="w-full rounded-2xl border border-white/10 light:border-slate-200 bg-navy-soft light:bg-white px-4 py-3.5 text-sm font-medium text-white light:text-navy disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send me a test notification'}
      </button>

      {state.message ? (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
          {state.message}
        </p>
      ) : null}
      {state.error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <p className="text-xs text-slate-500 light:text-slate-400">
        Lock your phone first, then tap. A test that arrives only while the
        app is open means the phone is holding alerts back, not the server.
      </p>
    </div>
  )
}
