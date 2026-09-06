import Link from 'next/link'
import { redirect } from 'next/navigation'
import { type EmailOtpType } from '@supabase/supabase-js'
import Wordmark from '@/components/wordmark'
import { createClient } from '@/lib/supabase/server'
import HashHandler from './hash-handler'

export const dynamic = 'force-dynamic'

export default async function RecoverPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; code?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  if (params.token_hash && params.type) {
    const { error } = await supabase.auth.verifyOtp({
      type: params.type as EmailOtpType,
      token_hash: params.token_hash,
    })
    if (!error) redirect('/auth/update-password')
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code)
    if (!error) redirect('/auth/update-password')
  }

  // Already signed in from a previous step? Go straight on.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/auth/update-password')

  return (
    <main className="tc-dark-page w-full px-5 py-10 text-white">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark size="sm" />
        </Link>

        <h1 className="text-2xl font-semibold text-white">Reset your password</h1>

        <HashHandler />
      </div>
    </main>
  )
}
