'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function markAllRead() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in again.' }

  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('driver_id', user.id)
    .is('read_at', null)

  revalidatePath('/dashboard', 'layout')
  return { ok: true }
}

export async function clearRead() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in again.' }

  await supabase
    .from('notifications')
    .delete()
    .eq('driver_id', user.id)
    .not('read_at', 'is', null)

  revalidatePath('/dashboard', 'layout')
  return { ok: true }
}
