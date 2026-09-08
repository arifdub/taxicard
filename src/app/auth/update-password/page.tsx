import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Wordmark from '@/components/wordmark'
import { createClient } from '@/lib/supabase/server'
import { RECOVERY_COOKIE } from '@/lib/recovery'
import UpdatePasswordForm from './form'

export const dynamic = 'force-dynamic'

export default async function UpdatePasswordPage() {
  // Only reachable straight after a reset link was verified on this
  // browser. Without the marker, being signed in is not enough.
  const store = await cookies()
  if (!store.get(RECOVERY_COOKIE)) redirect('/reset-password?expired=1')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
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
          For {user.email}. If that is not you, close this page.
        </p>

        <UpdatePasswordForm />
      </div>
    </main>
  )
}
