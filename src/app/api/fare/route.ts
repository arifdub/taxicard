import { NextResponse } from 'next/server'
import { estimateTrip } from '@/lib/trip'

const ERROR_MESSAGES: Record<string, string> = {
  both_not_found: "Both addresses couldn't be found.",
  pickup_not_found: "The pickup address couldn't be found.",
  destination_not_found: "The destination address couldn't be found.",
  no_route: "Couldn't find a driving route between those two.",
  lookup_failed: "Couldn't look up those addresses. Try again.",
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

  const result = await estimateTrip(pickup, destination, when, publicHoliday)

  if (!result.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGES[result.reason] ?? 'Something went wrong.' },
      { status: 422 }
    )
  }

  return NextResponse.json(result.estimate)
}
