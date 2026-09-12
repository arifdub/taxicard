// The service worker is served from a route rather than a file in
// /public, so the whole app can be deployed without binary uploads.

const SW = `
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch (e) {
    payload = {}
  }

  const url = payload.url || '/dashboard'

  event.waitUntil(
    self.registration.showNotification(payload.title || 'New booking request', {
      body: payload.body || 'Open TaxiCard to accept or decline.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: payload.tag || 'booking',
      renotify: true,
      requireInteraction: true,
      data: { url: url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const raw =
    (event.notification.data && event.notification.data.url) || '/dashboard'
  const target = new URL(raw, self.location.origin)

  event.waitUntil(
    (async () => {
      const list = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const client of list) {
        if (!('focus' in client)) continue

        // Already on the right page: just bring it forward.
        try {
          const here = new URL(client.url)
          if (here.pathname === target.pathname) {
            return client.focus()
          }
        } catch (e) {}

        // Navigate first and wait for it, otherwise focus resolves before
        // the move and the driver lands wherever they already were.
        if ('navigate' in client) {
          try {
            const moved = await client.navigate(target.href)
            if (moved && 'focus' in moved) return moved.focus()
            return client.focus()
          } catch (e) {
            // Some platforms refuse navigate on a standalone window.
            break
          }
        }
      }

      return self.clients.openWindow(target.href)
    })()
  )
})
`

export const dynamic = 'force-static'

export function GET() {
  return new Response(SW, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
