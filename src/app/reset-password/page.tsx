'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { requestReset, type FormState } from '@/app/auth/actions'
import { Field, Alert, Submit } from '@/components/ui'

const initial: FormState = {}

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(requestReset, initial)

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-10">
      <h1 className="text-2xl font-semibold text-navy">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-500">
        We will email you a link to set a new one.
      </p>

      <form action={action} className="mt-7 space-y-4">
        {state.error ? <Alert kind="error">{state.error}</Alert> : null}
        {state.message ? <Alert kind="ok">{state.message}</Alert> : null}

        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Submit pending={pending}>Send reset link</Submit>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-blue-700">
          Back to log in
        </Link>
      </p>
    </main>
  )
}
