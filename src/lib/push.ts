import 'server-only'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

type Sub = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

export type PushResult = {
  configured: boolean
  devices: number
  sent: number
  failed: number
  removed: number
  errors: string[]
}

function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  )
}

/**
 * Send a push to every device a driver has registered.
 *
 * Never throws: a booking must still succeed if the push fails. It does
 * report what happened, so a failure can be seen rather than guessed at.
 */
export async function pushToDriver(
  driverId: string,
  payload: { title: string; body: string; url?: string; tag?: string }
): Promise<PushResult> {
  const result: PushResult = {
    configured: configured(),
    devices: 0,
    sent: 0,
    failed: 0,
    removed: 0,
    errors: [],
  }

  if (!result.configured) {
    result.errors.push('VAPID keys are missing from the environment.')
    return result
  }

  webpush.setVapidDetails(
    `mailto:${process.env.PUSH_CONTACT_EMAIL ?? 'hello@taxicard.ie'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('driver_id', driverId)

  const subs = (data as Sub[] | null) ?? []
  result.devices = subs.length
  if (subs.length === 0) {
    result.errors.push('No device is registered for notifications.')
    return result
  }

  const dead: string[] = []

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60, urgency: 'high' }
        )
        result.sent += 1
      } catch (err) {
        const e = err as { statusCode?: number; body?: string; message?: string }
        result.failed += 1

        const where = s.endpoint.includes('push.apple.com')
          ? 'Apple'
          : s.endpoint.includes('fcm.googleapis.com')
            ? 'Google'
            : 'Push service'

        result.errors.push(
          `${where} returned ${e.statusCode ?? '?'}: ${
            (e.body || e.message || 'no detail').slice(0, 160)
          }`
        )

        console.error('[push] send failed', {
          driverId,
          statusCode: e.statusCode,
          body: e.body,
        })

        // 404 and 410: the browser discarded it.
        // 403: the subscription was made with a different VAPID key, so
        // it can never be delivered and must be created again.
        if (e.statusCode === 404 || e.statusCode === 410 || e.statusCode === 403) {
          dead.push(s.id)
        }
      }
    })
  )

  if (dead.length) {
    await supabase.from('push_subscriptions').delete().in('id', dead)
    result.removed = dead.length
    result.errors.push(
      `${dead.length} stale registration${dead.length === 1 ? '' : 's'} removed. Turn notifications off and on again to re-register this phone.`
    )
  }

  return result
}
