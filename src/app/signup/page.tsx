'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signUp, type FormState } from '@/app/auth/actions'
import { Field, Alert, Submit } from '@/components/ui'

const initial: FormState = {}

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUp, initial)

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 py-10">
      <h1 className="text-2xl font-semibold text-navy">Create your driver account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Takes a minute. You can fill in your vehicle details afterwards.
      </p>

      <form action={action} className="mt-7 space-y-4">
        {state.error ? <Alert kind="error">{state.error}</Alert> : null}

        <Field label="Your name" name="name" autoComplete="name" required placeholder="John Smith" />
        <Field label="Email" name="email" type="email" autoComplete="email" required placeholder="john@example.com" />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters"
        />

        <Submit pending={pending}>Create account</Submit>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-blue-700">
          Log in
        </Link>
      </p>
    </main>
  )
}
