import { NextResponse } from 'next/server'
import { getGoogleMapsApiKey } from '@/lib/settings'
import { placesAutocomplete } from '@/lib/places'

/**
 * Address suggestions as someone types a pickup or destination. Ireland
 * only, same as the rest of this app's geocoding. Returns an empty list
 * rather than an error whenever a key isn't configured, or Google
 * rejects it — the plain text field underneath still works either way.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = (searchParams.get('input') ?? '').trim()
  if (input.length < 3) return NextResponse.json({ suggestions: [] })

  const key = await getGoogleMapsApiKey()
  if (!key) return NextResponse.json({ suggestions: [] })

  const result = await placesAutocomplete(key, input)
  if (!result.ok) {
    console.error('[autocomplete] google error:', result.message)
    return NextResponse.json({ suggestions: [] })
  }

  return NextResponse.json({ suggestions: result.suggestions })
}
