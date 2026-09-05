import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TaxiCard',
    short_name: 'TaxiCard',
    description: 'Your digital taxi card and booking page.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#0B0B0C',
    theme_color: '#0F1B33',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icon-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
