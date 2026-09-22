import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TaxiCard Driver',
    short_name: 'TaxiCard',
    description: 'Your digital taxi card and booking page.',
    // The ?shellv marker is how the installed Android app reports its own
    // build to itself (see components/update-banner.tsx) — bump it, and
    // public/downloads/versions.json's latestShellVersion, together
    // whenever a new APK/AAB is packaged from this manifest.
    start_url: '/dashboard?shellv=1',
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
