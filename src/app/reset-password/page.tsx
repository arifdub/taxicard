'use client'

import Link from 'next/link'
import Wordmark from '@/components/wordmark'
import { useActionState } from 'react'
import { requestReset, type FormState } from '@/app/auth/actions'
import { Field, Alert, Submit } from '@/components/ui'

const initial: FormState = {}

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(requestReset, initial)

  return (
    <main className="tc-dark-page w-full px-5 py-10">
      <div className="tc-dark mx-auto w-full max-w-md">
      <Link href="/" className="mb-8 inline-block">
        <Wordmark size="md" />
      </Link>

      <h1 className="tc-left text-2xl font-semibold text-white">Reset your password</h1>
      <p className="tc-left tc-d1 mt-1 text-sm text-slate-400">
        We will email you a link to set a new one.
      </p>

      <form action={action} className="tc-in tc-d2 mt-7 space-y-4">
        {state.error ? <Alert kind="error">{state.error}</Alert> : null}
        {state.message ? <Alert kind="ok">{state.message}</Alert> : null}

        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Submit pending={pending}>Send reset link</Submit>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-brandblue">
          Back to log in
        </Link>
      </p>
          </div>
    </main>
  )
}
