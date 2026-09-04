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

  event.waitUntil(
    self.registration.showNotification(payload.title || 'New booking request', {
      body: payload.body || 'Open TaxiCard to accept or decline.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: payload.tag || 'booking',
      renotify: true,
      requireInteraction: true,
      data: { url: payload.url || '/dashboard' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
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
