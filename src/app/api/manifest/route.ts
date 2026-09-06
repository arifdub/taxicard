import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * A per-driver manifest, so a passenger who installs John's card gets an
 * icon that opens John's card — not the driver dashboard. The static
 * manifest at /manifest.webmanifest stays as the driver's version.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = (searchParams.get('slug') ?? '').trim().toLowerCase()

  let title = 'TaxiCard'
  let start = '/'

  if (/^[a-z0-9][a-z0-9-]{1,29}$/.test(slug)) {
    const supabase = await createClient()
    const { data } = await supabase.rpc('get_driver_card', { p_slug: slug })
    const card = data as { name?: string; business_name?: string | null } | null

    if (card?.name) {
      title = card.business_name ?? card.name
      start = `/${slug}`
    }
  }

  return NextResponse.json(
    {
      name: title,
      short_name: title.length > 12 ? title.slice(0, 12) : title,
      description: 'Book your taxi in a few taps.',
      start_url: start,
      scope: '/',
      display: 'standalone',
      background_color: '#0B0B0C',
      theme_color: '#0B0B0C',
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
    },
    {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=300',
      },
    }
  )
}
