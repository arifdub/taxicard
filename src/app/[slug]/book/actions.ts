'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { pushToDriver } from '@/lib/push'

export type BookingState = { error?: string }

const schema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number'),
  pickup: z.string().trim().min(3, 'Enter a pickup address'),
  destination: z.string().trim().min(2, 'Enter a destination'),
  when: z.enum(['NOW', 'LATER']),
  scheduled_at: z.string().trim().optional(),
  notes: z.string().trim().max(280).optional(),
  eircode: z.string().trim().max(10).optional(),
  pickup_lat: z.string().trim().optional(),
  pickup_lng: z.string().trim().optional(),
})

// The database raises named exceptions. Translate them into something a
// passenger can act on, and never leak the raw Postgres message.
const MESSAGES: Record<string, string> = {
  driver_not_found: 'This booking link is no longer active.',
  driver_unavailable:
    'This driver is not taking bookings right now. Try calling instead.',
  invalid_phone: 'Enter a valid phone number.',
  name_required: 'Enter your name.',
  pickup_required: 'Enter a pickup address.',
  destination_required: 'Enter a destination.',
  invalid_eircode: 'That Eircode does not look right. Leave it blank if unsure.',
  invalid_scheduled_at: 'Pick a date and time in the future.',
  scheduled_too_far: 'That is too far ahead. Pick a nearer date.',
  now_booking_disabled: 'This driver only takes advance bookings.',
  future_booking_disabled: 'This driver only takes immediate bookings.',
  rate_limited:
    'You have sent several requests already. Give the driver a moment, or call.',
}

export async function createBooking(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const v = parsed.data

  if (v.when === 'LATER' && !v.scheduled_at) {
    return { error: 'Pick a date and time.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_public_booking', {
    p_slug: v.slug,
    p_customer_name: v.name,
    p_customer_phone: v.phone,
    p_pickup_address: v.pickup,
    p_booking_type: v.when,
    p_destination_address: v.destination,
    p_scheduled_at: v.when === 'LATER' ? v.scheduled_at : null,
    p_customer_notes: v.notes || null,
    p_pickup_eircode: v.eircode || null,
    p_pickup_lat: v.pickup_lat ? Number(v.pickup_lat) : null,
    p_pickup_lng: v.pickup_lng ? Number(v.pickup_lng) : null,
  })

  if (error) {
    const key = Object.keys(MESSAGES).find((k) => error.message.includes(k))
    return { error: key ? MESSAGES[key] : 'Could not send your request. Try again.' }
  }

  const token = (data as { booking_token?: string } | null)?.booking_token
  if (!token) return { error: 'Could not send your request. Try again.' }

  // Alert the driver. Wrapped so a push failure never costs the customer
  // their booking, which is already safely stored at this point.
  try {
    const admin = createAdminClient()
    const { data: driver } = await admin
      .from('profiles')
      .select('id')
      .eq('slug', v.slug)
      .single()

    if (driver?.id) {
      await pushToDriver(driver.id, {
        title: 'New booking request',
        body: `${v.name} — ${v.pickup} to ${v.destination}`,
        url: '/dashboard',
        tag: token,
      })
    }
  } catch {
    // Deliberately silent.
  }

  redirect(`/b/${token}`)
}
