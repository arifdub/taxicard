/**
 * Passenger details remembered on their own phone.
 *
 * Deliberately not an account: this never leaves the device, needs no
 * login, and the person can wipe it in one tap. It exists so a regular
 * does not retype their name, number and address every time.
 */

const KEY = 'taxicard.passenger.v1'

export type SavedPassenger = {
  name: string
  phone: string
  eircode: string
  pickups: string[]
  destinations: string[]
}

const EMPTY: SavedPassenger = {
  name: '',
  phone: '',
  eircode: '',
  pickups: [],
  destinations: [],
}

export function loadPassenger(): SavedPassenger {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<SavedPassenger>
    return {
      name: parsed.name ?? '',
      phone: parsed.phone ?? '',
      eircode: parsed.eircode ?? '',
      pickups: Array.isArray(parsed.pickups) ? parsed.pickups.slice(0, 4) : [],
      destinations: Array.isArray(parsed.destinations)
        ? parsed.destinations.slice(0, 4)
        : [],
    }
  } catch {
    return EMPTY
  }
}

function remember(list: string[], value: string) {
  const v = value.trim()
  if (!v) return list
  // Most recent first, no duplicates, keep four.
  return [v, ...list.filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 4)
}

export function savePassenger(input: {
  name: string
  phone: string
  eircode?: string
  pickup?: string
  destination?: string
}) {
  if (typeof window === 'undefined') return
  try {
    const current = loadPassenger()
    const next: SavedPassenger = {
      name: input.name.trim() || current.name,
      phone: input.phone.trim() || current.phone,
      eircode: (input.eircode ?? '').trim() || current.eircode,
      pickups: remember(current.pickups, input.pickup ?? ''),
      destinations: remember(current.destinations, input.destination ?? ''),
    }
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Private browsing, or storage full. Not worth interrupting a booking.
  }
}

export function clearPassenger() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

export function hasSavedDetails(p: SavedPassenger) {
  return Boolean(p.name && p.phone)
}
