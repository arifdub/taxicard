import { NextResponse } from 'next/server'

/**
 * Turns coordinates into a readable address. The Google key stays on the
 * server. If no key is configured the booking still works — the form
 * keeps the coordinates and the passenger types the address themselves.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'bad coordinates' }, { status: 400 })
  }

  const key = process.env.GOOGLE_MAPS_SERVER_KEY
  if (!key) {
    return NextResponse.json({ configured: false })
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.set('latlng', `${lat},${lng}`)
    url.searchParams.set('region', 'ie')
    url.searchParams.set('key', key)

    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()

    if (data.status !== 'OK' || !data.results?.length) {
      return NextResponse.json({ configured: true, address: null })
    }

    const best = data.results[0]

    // Google returns the Eircode as the postal code in Ireland.
    const eircode =
      best.address_components?.find((c: { types: string[] }) =>
        c.types.includes('postal_code')
      )?.long_name ?? null

    return NextResponse.json({
      configured: true,
      address: best.formatted_address ?? null,
      eircode,
    })
  } catch {
    return NextResponse.json({ configured: true, address: null })
  }
}
