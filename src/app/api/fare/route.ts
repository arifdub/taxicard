import { NextResponse } from 'next/server'
import { calculateFare, rateBandFor } from '@/lib/fare'

type RouteResult = { distanceKm: number; durationMin: number; source: 'google' | 'osm' }

async function viaGoogle(pickup: string, destination: string): Promise<RouteResult | null> {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY
  if (!key) return null

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
  url.searchParams.set('origins', pickup)
  url.searchParams.set('destinations', destination)
  url.searchParams.set('region', 'ie')
  url.searchParams.set('units', 'metric')
  url.searchParams.set('key', key)

  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  const el = data?.rows?.[0]?.elements?.[0]
  if (data.status !== 'OK' || !el || el.status !== 'OK') return null

  return {
    distanceKm: el.distance.value / 1000,
    durationMin: el.duration.value / 60,
    source: 'google',
  }
}

/**
 * Free fallback so the calculator works before a Google key with
 * Distance Matrix enabled is set up: Nominatim geocodes each address,
 * then OSRM's public demo router gets the driving distance/time between
 * them. Fine at low volume; swap to Google before this gets busy.
 */
async function viaOsm(pickup: string, destination: string): Promise<RouteResult | null> {
  async function geocode(q: string): Promise<{ lat: number; lon: number } | null> {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', q)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('countrycodes', 'ie')
    url.searchParams.set('limit', '1')

    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'TaxiCard/1.0 (https://taxicard.ie)', 'Accept-Language': 'en' },
    })
    if (!res.ok) return null
    const data = await res.json()
    const best = data?.[0]
    if (!best) return null
    return { lat: Number(best.lat), lon: Number(best.lon) }
  }

  const [from, to] = await Promise.all([geocode(pickup), geocode(destination)])
  if (!from || !to) return null

  const url = new URL(
    `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}`
  )
  url.searchParams.set('overview', 'false')

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json()
  const route = data?.routes?.[0]
  if (!route) return null

  return { distanceKm: route.distance / 1000, durationMin: route.duration / 60, source: 'osm' }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const pickup = typeof body?.pickup === 'string' ? body.pickup.trim() : ''
  const destination = typeof body?.destination === 'string' ? body.destination.trim() : ''
  const publicHoliday = Boolean(body?.publicHoliday)
  const when = typeof body?.when === 'string' ? new Date(body.when) : new Date()

  if (!pickup || !destination) {
    return NextResponse.json({ error: 'Enter a pickup and a destination.' }, { status: 400 })
  }

  let route: RouteResult | null = null
  try {
    route = (await viaGoogle(pickup, destination)) ?? (await viaOsm(pickup, destination))
  } catch {
    // fall through
  }

  if (!route) {
    return NextResponse.json(
      { error: "Couldn't find a route between those two addresses." },
      { status: 422 }
    )
  }

  const band = rateBandFor(when, publicHoliday)
  const fare = calculateFare(route.distanceKm, route.durationMin, band)

  return NextResponse.json({ ...fare, source: route.source })
}
