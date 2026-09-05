'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionResult = { error?: string; ok?: boolean }

// Only these moves are allowed. Anything else is either a mistake or
// someone poking at the action directly.
const ALLOWED: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'DECLINED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  ACCEPTED: ['COMPLETED', 'CANCELLED'],
}

export async function updateBookingStatus(
  id: string,
  next: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in again.' }

  const { data: current } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('id', id)
    .single()

  if (!current) return { error: 'That booking is gone.' }

  const from = current.status as string
  if (!ALLOWED[from]?.includes(next)) {
    return { error: `Cannot move a ${from.toLowerCase()} booking to ${next.toLowerCase()}.` }
  }

  // RLS confines this to the driver's own bookings.
  const { error } = await supabase
    .from('bookings')
    .update({ status: next })
    .eq('id', id)

  if (error) return { error: 'Could not update that booking.' }

  revalidatePath('/dashboard', 'layout')
  return { ok: true }
}

export async function markNotificationsRead() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('driver_id', user.id)
    .eq('read', false)

  revalidatePath('/dashboard', 'layout')
}
