'use client'

import Link from 'next/link'
import Wordmark from '@/components/wordmark'
import { useActionState } from 'react'
import { signUp, type FormState } from '@/app/auth/actions'
import { Field, Alert, Submit } from '@/components/ui'

const initial: FormState = {}

export default function SignUpPage() {
  const [state, action, pending] = useActionState(signUp, initial)

  return (
    <main className="tc-dark-page w-full px-5 py-10">
      <div className="tc-dark mx-auto w-full max-w-md">
      <Link href="/" className="mb-8 inline-block">
        <Wordmark size="md" />
      </Link>

      <h1 className="tc-left text-2xl font-semibold text-white">Create your driver account</h1>
      <p className="tc-left tc-d1 mt-1 text-sm text-slate-400">
        Takes a minute. You can fill in your vehicle details afterwards.
      </p>

      <form action={action} className="tc-in tc-d2 mt-7 space-y-4">
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

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brandblue">
          Log in
        </Link>
      </p>
          </div>
    </main>
  )
}
