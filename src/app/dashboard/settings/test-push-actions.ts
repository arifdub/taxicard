'use server'

import { createClient } from '@/lib/supabase/server'
import { pushToDriver } from '@/lib/push'

export type TestState = { message?: string; error?: string }

/**
 * Sends a real push to the signed-in driver and reports what the push
 * service said. The point is to make a silent failure visible.
 */
export async function sendTestPush(): Promise<TestState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in again.' }

  const res = await pushToDriver(user.id, {
    title: 'TaxiCard test',
    body: 'If you can see this, alerts are working.',
    url: '/dashboard',
    tag: 'test',
  })

  if (!res.configured) {
    return { error: 'Notifications are not set up on the server.' }
  }

  if (res.devices === 0) {
    return {
      error:
        'No device registered. Turn the notifications switch on from the phone you want alerts on.',
    }
  }

  if (res.sent > 0) {
    return {
      message: `Sent to ${res.sent} of ${res.devices} device${
        res.devices === 1 ? '' : 's'
      }. It should arrive within a few seconds.${
        res.failed > 0 ? ` ${res.failed} failed: ${res.errors[0]}` : ''
      }`,
    }
  }

  return { error: res.errors[0] ?? 'The push service rejected it.' }
}
