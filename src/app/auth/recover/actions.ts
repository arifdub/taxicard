'use server'

import { cookies } from 'next/headers'
import { RECOVERY_COOKIE } from '@/lib/recovery'

/**
 * Marks this browser as having just completed a password-reset link.
 * /auth/update-password refuses to run without it, so an unrelated
 * session that happens to be signed in on the same phone can never be
 * used to change a password through a stale or failed link.
 */
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

export async function clearRecovery() {
  const store = await cookies()
  store.delete(RECOVERY_COOKIE)
}
