import { createClient } from '@/lib/supabase/server'

/**
 * A calendar file for one booking. Phones open .ics natively, so tapping
 * the link offers to add it — no calendar permissions, no integration.
 */

function fold(line: string) {
  // iCalendar lines must not exceed 75 octets.
  if (line.length <= 73) return line
  const parts: string[] = []
  let rest = line
  parts.push(rest.slice(0, 73))
  rest = rest.slice(73)
  while (rest.length > 72) {
    parts.push(' ' + rest.slice(0, 72))
    rest = rest.slice(72)
  }
  if (rest) parts.push(' ' + rest)
  return parts.join('\r\n')
}

function esc(v: string) {
  return v
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function stamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Not found', { status: 404 })

  const { data } = await supabase
    .from('bookings')
    .select(
      'id, pickup_address, pickup_eircode, destination_address, booking_type, scheduled_at, customer_notes, customers(name, phone)'
    )
    .eq('id', id)
    .eq('driver_id', user.id)
    .maybeSingle()

  if (!data) return new Response('Not found', { status: 404 })

  const b = data as unknown as {
    id: string
    pickup_address: string
    pickup_eircode: string | null
    destination_address: string | null
    scheduled_at: string | null
    customer_notes: string | null
    customers: { name: string | null; phone: string | null } | null
  }

  const start = b.scheduled_at ? new Date(b.scheduled_at) : new Date()
  const end = new Date(start.getTime() + 45 * 60 * 1000)

  const who = b.customers?.name ?? 'Passenger'
  const summary = `Taxi: ${who}${
    b.destination_address ? ` to ${b.destination_address}` : ''
  }`

  const description = [
    who,
    b.customers?.phone ?? '',
    `Pickup: ${b.pickup_address}${b.pickup_eircode ? ` (${b.pickup_eircode})` : ''}`,
    b.destination_address ? `Destination: ${b.destination_address}` : '',
    b.customer_notes ?? '',
  ]
    .filter(Boolean)
    .join('\n')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TaxiCard//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${b.id}@taxicard.ie`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    fold(`SUMMARY:${esc(summary)}`),
    fold(`LOCATION:${esc(b.pickup_address)}`),
    fold(`DESCRIPTION:${esc(description)}`),
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Taxi pickup in 30 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="taxicard-${b.id.slice(0, 8)}.ics"`,
      'Cache-Control': 'no-store',
    },
  })
}
