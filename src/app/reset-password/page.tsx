'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import Wordmark from '@/components/wordmark'
import { createImplicitClient } from '@/lib/supabase/implicit'
import { Field, Alert, Submit } from '@/components/ui'

function ResetForm() {
  const params = useSearchParams()
  const expired = params.get('expired') === '1'
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(formData: FormData) {
    const email = String(formData.get('email') || '').trim().toLowerCase()
    if (!email.includes('@')) {
      setError('Enter a valid email')
      return
    }

    setPending(true)
    setError(null)

    // Sent from the browser so the link is not tied to one device.
    const supabase = createImplicitClient()
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/auth/recover` }
    )

    setPending(false)

    if (sendError) {
      setError(
        sendError.message.toLowerCase().includes('rate')
          ? 'Too many requests. Wait a few minutes and try again.'
          : 'Could not send that email. Try again shortly.'
      )
      return
    }

    setMessage(
      'If that email has an account, a reset link is on its way. It lasts one hour. Open it in any browser.'
    )
  }

  return (
    <>
      <form action={onSubmit} className="tc-in tc-d2 mt-7 space-y-4">
        {expired ? (
          <Alert kind="error">
            That link has expired or was already used. Ask for a new one.
          </Alert>
        ) : null}
        {error ? <Alert kind="error">{error}</Alert> : null}
        {message ? <Alert kind="ok">{message}</Alert> : null}

        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Submit pending={pending}>Send reset link</Submit>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link href="/login" className="text-brandblue">
          Back to log in
        </Link>
      </p>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="tc-dark-page w-full px-5 py-10 text-white">
      <div className="tc-dark mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark size="sm" />
        </Link>

        <h1 className="tc-left text-2xl font-semibold text-white">
          Reset your password
        </h1>
        <p className="tc-left tc-d1 mt-1 text-sm text-slate-400">
          We will email you a link to set a new one.
        </p>

        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  )
}
