'use client'

import { useActionState } from 'react'
import { updatePassword, type PasswordState } from './actions'
import { Field, Alert, Submit } from '@/components/ui'

const initial: PasswordState = {}

export default function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial)

  return (
    <form action={action} className="tc-in tc-d2 mt-7 space-y-4">
      {state.error ? <Alert kind="error">{state.error}</Alert> : null}

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
