export type RateBand = 'standard' | 'premium' | 'special'

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

/**
 * Which of the three NTA rate bands applies at a given moment.
 * Public holidays aren't auto-detected (that needs a full Irish bank
 * holiday calendar) — callers pass `publicHoliday` explicitly instead.
 */
export function rateBandFor(date: Date, publicHoliday = false): RateBand {
  const day = date.getDay() // 0 = Sunday, 6 = Saturday
  const hour = date.getHours()
  const month = date.getMonth() // 0-indexed, 11 = December
  const dom = date.getDate()

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
