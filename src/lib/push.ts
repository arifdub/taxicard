import 'server-only'
import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

type Sub = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  )
}

/**
 * Send a push to every device a driver has registered.
 * Never throws: a booking must still succeed if the push fails.
 */
export async function pushToDriver(
  driverId: string,
  payload: { title: string; body: string; url?: string; tag?: string }
) {
  if (!configured()) return

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
  if (subs.length === 0) return

  const dead: string[] = []

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        )
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode
        // 404 and 410 mean the browser threw the subscription away.
        if (code === 404 || code === 410) dead.push(s.id)
      }
    })
  )

  if (dead.length) {
    await supabase.from('push_subscriptions').delete().in('id', dead)
  }
}
