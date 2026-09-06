import Link from 'next/link'
import { redirect } from 'next/navigation'
import Wordmark from '@/components/wordmark'
import { createClient } from '@/lib/supabase/server'
import UpdatePasswordForm from './form'

export const dynamic = 'force-dynamic'

export default async function UpdatePasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Arriving here without a session means the link was used, expired, or
  // was opened in a different browser from the one that asked.
  if (!user) redirect('/reset-password?expired=1')

  return (
    <main className="tc-dark-page w-full px-5 py-10 text-white">
      <div className="tc-dark mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark size="sm" />
        </Link>

        <h1 className="tc-left text-2xl font-semibold text-white">
          Set a new password
        </h1>
        <p className="tc-left tc-d1 mt-1 text-sm text-slate-400">
          Signed in as {user.email}.
        </p>

        <UpdatePasswordForm />
      </div>
    </main>
  )
}
