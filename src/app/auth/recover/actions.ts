'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { type EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { RECOVERY_COOKIE } from '@/lib/recovery'

export async function markRecovery() {
  const store = await cookies()
  store.set(RECOVERY_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 15,
  })
}

export type RecoverState = { error?: string }

/**
 * Verifies the reset token. Deliberately only runs on a form submit,
 * never on page load: mail providers fetch links in messages to scan
 * them, and a single-use token opened by a scanner is dead before the
 * person ever taps it. Scanners do not submit forms.
 */
export async function completeRecovery(
  _prev: RecoverState,
  formData: FormData
): Promise<RecoverState> {
  const token_hash = String(formData.get('token_hash') || '')
  const type = String(formData.get('type') || '') as EmailOtpType
  const code = String(formData.get('code') || '')

  const supabase = await createClient()

  // Clear whoever was signed in on this phone first.
  await supabase.auth.signOut()

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (error) {
      return {
        error:
          'That link did not work. It may have expired — links last one hour. Ask for a new one.',
      }
    }
    await markRecovery()
    redirect('/auth/update-password')
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return {
        error:
          'That link did not work in this browser. Open it in the browser you asked from, or request a new one.',
      }
    }
    await markRecovery()
    redirect('/auth/update-password')
  }

  return { error: 'That link is missing its code. Ask for a new one.' }
}
