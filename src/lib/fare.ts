export type RateBand = 'standard' | 'premium' | 'special'

// A pre-arranged booking (as opposed to a street hail) carries the NTA's
// booking fee. Every booking created through the app — card, web, or
// admin dispatch — is by definition pre-arranged, so this is added
// automatically wherever a booking's fare is estimated. The standalone
// fare calculator keeps it as an optional toggle instead, since it's
// estimating a generic trip, not necessarily a booking.
export const BOOKING_FEE = 3

export const RATE_LABELS: Record<RateBand, string> = {
  standard: 'Standard Rate',
  premium: 'Premium Rate',
  special: 'Special Rate',
}

// NTA National Maximum Taxi Fare, effective from the fare card supplied.
// "or" bands are billed at whichever is higher at each tier, matching how
// a taxi meter charges more for distance at speed and more for time stuck
// in traffic.
const RATES: Record<
  RateBand,
  {
    initial: number
    aPerKm: number
    aPerMin: number
    aCap: number
    bPerKm: number
    bPerMin: number
  }
> = {
  standard: { initial: 4.4, aPerKm: 1.32, aPerMin: 0.47, aCap: 23.6, bPerKm: 1.72, bPerMin: 0.61 },
  premium: { initial: 5.4, aPerKm: 1.81, aPerMin: 0.64, aCap: 31.8, bPerKm: 2.2, bPerMin: 0.78 },
  // Special rate is one flat tariff for the whole trip after the initial
  // charge, so tariff A and B are identical and the cap never binds.
  special: { initial: 5.4, aPerKm: 2.2, aPerMin: 0.78, aCap: Infinity, bPerKm: 2.2, bPerMin: 0.78 },
}

const INITIAL_KM = 0.5
const INITIAL_MIN = 85 / 60
const TARIFF_A_KM = 15
const TARIFF_A_MIN = 43

const DUBLIN_WEEKDAY: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

/**
 * The day/hour/month in Ireland, regardless of what timezone the server
 * this code runs on happens to be in — Date.getHours() etc. use the
 * *server's* local clock, which on a US-hosted server would read a
 * Dublin afternoon booking as the middle of the night and pick the
 * wrong rate band entirely.
 */
function dublinParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Dublin',
    weekday: 'short',
    hourCycle: 'h23',
    hour: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).formatToParts(date)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''

  return {
    day: DUBLIN_WEEKDAY[get('weekday')] ?? date.getDay(),
    hour: Number(get('hour')),
    dom: Number(get('day')),
    month: Number(get('month')) - 1, // 0-indexed, matching Date.getMonth()
  }
}

/**
 * Which of the three NTA rate bands applies at a given moment, always
 * read against Ireland's clock and calendar.
 * Public holidays aren't auto-detected (that needs a full Irish bank
 * holiday calendar) — callers pass `publicHoliday` explicitly instead.
 */
export function rateBandFor(date: Date, publicHoliday = false): RateBand {
  const { day, hour, month, dom } = dublinParts(date)

  const weekendSmallHours = (day === 6 || day === 0) && hour < 4
  const christmasSpecial =
    (month === 11 && dom === 24 && hour >= 20) ||
    (month === 11 && dom === 25) ||
    (month === 11 && dom === 26 && hour < 8)
  const newYearSpecial =
    (month === 11 && dom === 31 && hour >= 20) || (month === 0 && dom === 1 && hour < 8)

  if (weekendSmallHours || christmasSpecial || newYearSpecial) return 'special'
  if (day === 0 || publicHoliday || hour >= 20 || hour < 8) return 'premium'
  return 'standard'
}

export type FareBreakdown = {
  band: RateBand
  bandLabel: string
  distanceKm: number
  durationMin: number
  initial: number
  tariffA: number
  tariffB: number
  total: number
}

export function calculateFare(
  distanceKm: number,
  durationMin: number,
  band: RateBand
): FareBreakdown {
  const r = RATES[band]

  const billableKm = Math.max(0, distanceKm - INITIAL_KM)
  const billableMin = Math.max(0, durationMin - INITIAL_MIN)

  const aKm = Math.min(billableKm, TARIFF_A_KM)
  const aMin = Math.min(billableMin, TARIFF_A_MIN)
  const tariffA = Math.min(Math.max(aKm * r.aPerKm, aMin * r.aPerMin), r.aCap)

  const bKm = Math.max(0, billableKm - TARIFF_A_KM)
  const bMin = Math.max(0, billableMin - TARIFF_A_MIN)
  const tariffB = Math.max(bKm * r.bPerKm, bMin * r.bPerMin)

  const round2 = (n: number) => Math.round(n * 100) / 100

  return {
    band,
    bandLabel: RATE_LABELS[band],
    distanceKm: round2(distanceKm),
    durationMin: Math.round(durationMin),
    initial: r.initial,
    tariffA: round2(tariffA),
    tariffB: round2(tariffB),
    total: round2(r.initial + tariffA + tariffB),
  }
}
