import { type SupabaseClient } from '@supabase/supabase-js'
import { type BookingRow } from '@/components/booking-card'

const SELECT =
  'id, status, pickup_address, pickup_eircode, pickup_lat, pickup_lng, destination_address, booking_type, scheduled_at, customer_notes, created_at, customers(name, phone)'

type RawCustomer = { name: string; phone: string }
type RawBooking = {
  id: string
  status: string
  pickup_address: string
  pickup_eircode: string | null
  pickup_lat: number | null
  pickup_lng: number | null
  destination_address: string | null
  booking_type: string
  scheduled_at: string | null
  customer_notes: string | null
  created_at: string
  customers: RawCustomer | RawCustomer[] | null
}

function flatten(row: RawBooking): BookingRow {
  const c = Array.isArray(row.customers) ? row.customers[0] : row.customers
  return {
    id: row.id,
    status: row.status,
    pickup_address: row.pickup_address,
    pickup_eircode: row.pickup_eircode,
    pickup_lat: row.pickup_lat,
    pickup_lng: row.pickup_lng,
    destination_address: row.destination_address,
    booking_type: row.booking_type,
    scheduled_at: row.scheduled_at,
    customer_notes: row.customer_notes,
    created_at: row.created_at,
    customer_name: c?.name ?? 'Customer',
    customer_phone: c?.phone ?? '',
  }
}

export async function fetchBookings(
  supabase: SupabaseClient,
  opts: { statuses?: string[]; since?: string; until?: string; limit?: number } = {}
): Promise<BookingRow[]> {
  let q = supabase.from('bookings').select(SELECT)

  if (opts.statuses?.length) q = q.in('status', opts.statuses)
  if (opts.since) q = q.gte('scheduled_at', opts.since)
  if (opts.until) q = q.lt('scheduled_at', opts.until)

  const { data } = await q
    .order('scheduled_at', { ascending: true })
    .limit(opts.limit ?? 50)

  return ((data as RawBooking[] | null) ?? []).map(flatten)
}
