'use client'

import { useActionState, useState } from 'react'
import { changePassword, type ChangeState } from './password-actions'
import { Field, Alert, Submit } from '@/components/ui'

const initial: ChangeState = {}

export default function PasswordForm() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(changePassword, initial)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-white/10 bg-navy-soft px-4 py-3.5 text-sm font-medium text-white"
      >
        Change my password
      </button>
    )
  }

  return (
    <form
      action={action}
      className="space-y-3 rounded-2xl border border-white/10 bg-navy-soft p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Change password</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-slate-400"
        >
          Cancel
        </button>
      </div>

      {state.error ? <Alert kind="error">{state.error}</Alert> : null}
      {state.message ? <Alert kind="ok">{state.message}</Alert> : null}

      <Field
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters"
      />
      <Field
        label="Confirm new password"
        name="confirm"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
      />

      <Submit pending={pending}>Save new password</Submit>
    </form>
  )
}
