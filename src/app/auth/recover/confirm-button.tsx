'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { completeRecovery, type RecoverState } from './actions'

const initial: RecoverState = {}

export default function ConfirmButton({
  tokenHash,
  type,
  code,
}: {
  tokenHash: string
  type: string
  code: string
}) {
  const [state, action, pending] = useActionState(completeRecovery, initial)

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="code" value={code} />

      {state.error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <p className="text-sm text-slate-300">
        Tap below to continue and choose a new password.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-yellow px-4 py-4 text-lg font-semibold text-navy disabled:opacity-60"
      >
        {pending ? 'Checking…' : 'Continue'}
      </button>

      {state.error ? (
        <Link
          href="/reset-password"
          className="block text-center text-sm text-brandblue"
        >
          Send me a new link
        </Link>
      ) : null}
    </form>
  )
}
