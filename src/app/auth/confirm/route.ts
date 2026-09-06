import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Handles both shapes of Supabase email link:
 *  - token_hash + type   (the template we ask for)
 *  - code                (PKCE, used by some templates)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')

  // A recovery link should land on the page where you set a new password,
  // not the dashboard — otherwise you are signed in but never asked.
  const fallback = type === 'recovery' ? '/auth/update-password' : '/dashboard'
  const next = searchParams.get('next') ?? fallback

  const supabase = await createClient()

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) redirect(next.startsWith('/') ? next : fallback)
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) redirect(next.startsWith('/') ? next : fallback)
  }

  redirect('/login?error=link_expired')
}
