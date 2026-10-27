import { NextResponse } from 'next/server'
import { getGoogleMapsApiKey } from '@/lib/settings'

/**
 * Address suggestions as someone types a pickup or destination. Ireland
 * only, same as the rest of this app's geocoding. Returns an empty list
 * rather than an error whenever a key isn't configured — the plain text
 * field underneath still works either way.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = (searchParams.get('input') ?? '').trim()
  if (input.length < 3) return NextResponse.json({ suggestions: [] })

  const key = await getGoogleMapsApiKey()
  if (!key) return NextResponse.json({ suggestions: [] })

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
  url.searchParams.set('input', input)
  url.searchParams.set('components', 'country:ie')
  url.searchParams.set('key', key)

  try {
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[autocomplete] google status:', data.status, data.error_message)
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = ((data.predictions ?? []) as { place_id: string; description: string }[])
      .slice(0, 6)
      .map((p) => ({ id: p.place_id, description: p.description }))

    return NextResponse.json({ suggestions })
  } catch (err) {
    console.error('[autocomplete] request failed:', err)
    return NextResponse.json({ suggestions: [] })
  }
}
