'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useActionState } from 'react'
import { logIn, type FormState } from '@/app/auth/actions'
import { Field, Alert, Submit } from '@/components/ui'

const initial: FormState = {}

function LoginForm() {
  const params = useSearchParams()
  const next = params.get('next') ?? '/dashboard'
  const expired = params.get('error') === 'link_expired'
  const [state, action, pending] = useActionState(logIn, initial)

  return (
    <>
      <form action={action} className="mt-7 space-y-4">
        {expired ? <Alert kind="error">That link has expired. Log in instead.</Alert> : null}
        {state.error ? <Alert kind="error">{state.error}</Alert> : null}

        <input type="hidden" name="next" value={next} />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" required />

        <Submit pending={pending}>Log in</Submit>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/reset-password" className="text-blue-700">
          Forgot your password?
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-10">
      <h1 className="text-2xl font-semibold text-navy">Log in</h1>
      <p className="mt-1 text-sm text-slate-500">Welcome back.</p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{' '}
        <Link href="/signup" className="font-medium text-blue-700">
          Create an account
        </Link>
      </p>
    </main>
  )
}
