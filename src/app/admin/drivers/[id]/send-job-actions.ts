'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { pushToDriver } from '@/lib/push'
import { estimateTrip } from '@/lib/trip'
import { BOOKING_FEE } from '@/lib/fare'

export type SendJobState = { error?: string; message?: string }

const schema = z.object({
  name: z.string().trim().min(2, 'Enter the customer name'),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number'),
  pickup: z.string().trim().min(3, 'Enter a pickup address'),
  eircode: z.string().trim().max(10).optional(),
  destination: z.string().trim().min(2, 'Enter a destination'),
  when: z.enum(['NOW', 'LATER']),
  scheduled_at: z.string().trim().optional(),
  notes: z.string().trim().max(280).optional(),
  fare: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^\d{1,5}([.,]\d{1,2})?$/.test(v),
      'Enter a fare like 25 or 25.50'
    ),
})

// Named exceptions from create_public_booking, same ones the public
// trip-details form already translates — this goes through the same RPC,
// just filled in by an admin instead of the passenger.
const MESSAGES: Record<string, string> = {
  driver_unavailable: 'This driver is not taking trip requests right now.',
  invalid_phone: 'Enter a valid phone number.',
  name_required: 'Enter the customer name.',
  pickup_required: 'Enter a pickup address.',
  destination_required: 'Enter a destination.',
  invalid_eircode: 'That Eircode does not look right.',
  invalid_scheduled_at: 'Pick a date and time in the future.',
  scheduled_too_far: 'That is too far ahead. Pick a nearer date.',
  now_booking_disabled: 'This driver only takes advance requests.',
  future_booking_disabled: 'This driver only takes immediate requests.',
  rate_limited: 'Too many requests sent just now. Give it a minute.',
}

/**
 * A job sent straight to one driver, rather than broadcast to every
 * business driver. Goes through the same create_public_booking path a
 * passenger uses — it lands in this driver's own Pending bookings, rings
 * their phone, and nobody else ever sees it.
 */
export async function sendDriverJob(
  driverId: string,
  _prev: SendJobState,
  formData: FormData
): Promise<SendJobState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in again.' }

  const { data: admin } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
  if (!admin?.is_admin) return { error: 'Only administrators can do this.' }

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const v = parsed.data
  if (v.when === 'LATER' && !v.scheduled_at) {
    return { error: 'Pick a date and time.' }
  }

  const { data: driver } = await supabase
    .from('profiles')
    .select('slug, name')
    .eq('id', driverId)
    .maybeSingle()
  if (!driver?.slug) return { error: 'This driver no longer exists.' }

  // Best-effort: a geocoding hiccup should never block sending the job.
  // Distance is always worth showing when it can be found, even when the
  // admin has set a fixed fare below.
  let distanceKm: number | null = null
  let estimatedFare: number | null = null
  try {
    const trip = await estimateTrip(v.pickup, v.destination)
    if (trip.ok) {
      distanceKm = trip.estimate.distanceKm
      estimatedFare = trip.estimate.total + BOOKING_FEE
    }
  } catch {
    // leave both null
  }

  // An admin-set fare is the final price, not an estimate on top of it —
  // same as the dispatch job form, it replaces the calculated figure
  // rather than adding the booking fee to it.
  if (v.fare) {
    estimatedFare = Number(v.fare.replace(',', '.'))
  }

  const { data, error } = await supabase.rpc('create_public_booking', {
    p_slug: driver.slug,
    p_customer_name: v.name,
    p_customer_phone: v.phone,
    p_pickup_address: v.pickup,
    p_booking_type: v.when,
    p_destination_address: v.destination,
    p_scheduled_at: v.when === 'LATER' ? v.scheduled_at : null,
    p_customer_notes: v.notes || null,
    p_pickup_eircode: v.eircode || null,
    p_pickup_lat: null,
    p_pickup_lng: null,
    p_distance_km: distanceKm,
    p_estimated_fare: estimatedFare,
  })

  if (error) {
    const key = Object.keys(MESSAGES).find((k) => error.message.includes(k))
    return { error: key ? MESSAGES[key] : 'Could not send that job. Try again.' }
  }

  const token = (data as { booking_token?: string } | null)?.booking_token
  if (!token) return { error: 'Could not send that job. Try again.' }

  // Alert the driver. A push failure must never undo a job that already
  // saved successfully.
  try {
    const estimate =
      distanceKm != null && estimatedFare != null
        ? `${distanceKm}km - €${estimatedFare.toFixed(0)} · `
        : ''
    await pushToDriver(driverId, {
      title: 'New job from admin',
      body: `${estimate}${v.name} — ${v.pickup} to ${v.destination}`,
      url: '/dashboard/bookings',
      tag: token,
    })
  } catch {
    // Deliberately silent.
  }

  revalidatePath('/admin', 'layout')
  return { message: `Sent to ${driver.name ?? 'the driver'}.` }
}
