import { NextResponse } from 'next/server'

type Result = {
  address: string | null
  eircode: string | null
  source: 'google' | 'osm' | 'none'
}

async function viaGoogle(lat: number, lng: number): Promise<Result | null> {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY
  if (!key) return null

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('latlng', `${lat},${lng}`)
  url.searchParams.set('region', 'ie')
  url.searchParams.set('key', key)

  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  if (data.status !== 'OK' || !data.results?.length) return null

  const best = data.results[0]
  const eircode =
    best.address_components?.find((c: { types: string[] }) =>
      c.types.includes('postal_code')
    )?.long_name ?? null

  return { address: best.formatted_address ?? null, eircode, source: 'google' }
}

/**
 * Free fallback so the button still works before a Google key is added.
 * OpenStreetMap asks for an identifying User-Agent and is fine at low
 * volume; swap to Google before this gets busy.
 */
async function viaOsm(lat: number, lng: number): Promise<Result | null> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('zoom', '18')
  url.searchParams.set('addressdetails', '1')

  const res = await fetch(url, {
    cache: 'no-store',
    headers: {
      'User-Agent': 'TaxiCard/1.0 (https://taxicard.ie)',
      'Accept-Language': 'en',
    },
  })
  if (!res.ok) return null

  const data = await res.json()
  const a = data.address ?? {}

  // Build something a driver can actually read, nearest first.
  const line = [
    [a.house_number, a.road].filter(Boolean).join(' '),
    a.neighbourhood || a.suburb || a.village || a.town,
    a.city || a.county,
  ]
    .filter(Boolean)
    .join(', ')

  return {
    address: line || data.display_name || null,
    eircode: a.postcode ?? null,
    source: 'osm',
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'bad coordinates' }, { status: 400 })
  }

  try {
    const result = (await viaGoogle(lat, lng)) ?? (await viaOsm(lat, lng))
    if (result) return NextResponse.json(result)
  } catch {
    // fall through
  }

  return NextResponse.json({ address: null, eircode: null, source: 'none' })
}
