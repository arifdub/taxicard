import { calculateFare, rateBandFor, type FareBreakdown } from '@/lib/fare'

type LatLng = { lat: number; lng: number }
type Geocoded = LatLng & { source: 'google' | 'osm' }

/**
 * "D02AF30" -> "D02 AF30". Google's geocoder is far more reliable at
 * matching an Eircode when it's spaced like this; harmless no-op for a
 * plain address or town name, since the pattern just won't match.
 */
function normalize(query: string): string {
  const m = query.trim().match(/^([A-Za-z]\d{2})[\s-]?([A-Za-z0-9]{4})$/)
  return m ? `${m[1].toUpperCase()} ${m[2].toUpperCase()}` : query
}

async function geocodeGoogle(query: string): Promise<LatLng | null> {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY
  if (!key) return null

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('address', query)
  url.searchParams.set('components', 'country:IE')
  url.searchParams.set('key', key)

  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  const loc = data?.results?.[0]?.geometry?.location
  if (data.status !== 'OK' || !loc) return null

  return { lat: loc.lat, lng: loc.lng }
}

/**
 * Free fallback, used only when there's no Google key. It can't resolve
 * Eircodes — that data is commercially licensed and OpenStreetMap doesn't
 * have it — but it's fine for a plain address or town name.
 */
async function geocodeOsm(query: string): Promise<LatLng | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', query)
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

  return { lat: Number(best.lat), lng: Number(best.lon) }
}

async function geocode(rawQuery: string): Promise<Geocoded | null> {
  const query = normalize(rawQuery)
  const g = await geocodeGoogle(query)
  if (g) return { ...g, source: 'google' }
  const o = await geocodeOsm(query)
  if (o) return { ...o, source: 'osm' }
  return null
}

async function route(
  from: LatLng,
  to: LatLng
): Promise<{ distanceKm: number; durationMin: number } | null> {
  const url = new URL(
    `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}`
  )
  url.searchParams.set('overview', 'false')

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return null

  const data = await res.json()
  const best = data?.routes?.[0]
  if (!best) return null

  return { distanceKm: best.distance / 1000, durationMin: best.duration / 60 }
}

export type TripEstimate = FareBreakdown & { source: 'google' | 'osm' }

export type TripResult =
  | { ok: true; estimate: TripEstimate }
  | { ok: false; reason: string }

/**
 * Distance, duration and an NTA-tariff fare estimate between two
 * addresses (full address, Eircode, or town name — see normalize()).
 * Used by the fare calculator, and meant for reuse wherever a booking is
 * created, so a driver sees the estimated km/fare on the job itself.
 */
export async function estimateTrip(
  pickup: string,
  destination: string,
  when: Date = new Date(),
  publicHoliday = false
): Promise<TripResult> {
  let from: Geocoded | null = null
  let to: Geocoded | null = null
  try {
    ;[from, to] = await Promise.all([geocode(pickup), geocode(destination)])
  } catch {
    return { ok: false, reason: 'lookup_failed' }
  }

  if (!from || !to) {
    return {
      ok: false,
      reason: !from && !to ? 'both_not_found' : !from ? 'pickup_not_found' : 'destination_not_found',
    }
  }

  const distance = await route(from, to).catch(() => null)
  if (!distance) return { ok: false, reason: 'no_route' }

  const band = rateBandFor(when, publicHoliday)
  const fare = calculateFare(distance.distanceKm, distance.durationMin, band)
  const source = from.source === 'google' && to.source === 'google' ? 'google' : 'osm'

  return { ok: true, estimate: { ...fare, source } }
}
