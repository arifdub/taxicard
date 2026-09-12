'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Both of these are used directly as <form action={...}>, so they must
 * return nothing. React rejects a form action that resolves to a value.
 */

export async function markAllRead(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('driver_id', user.id)
    .is('read_at', null)

  revalidatePath('/dashboard', 'layout')
}

export async function clearRead(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .delete()
    .eq('driver_id', user.id)
    .not('read_at', 'is', null)

  revalidatePath('/dashboard', 'layout')
}
