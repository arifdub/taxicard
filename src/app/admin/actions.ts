'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type AdminResult = { error?: string; ok?: boolean }

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return data?.is_admin ? { supabase, user } : null
}

export async function setDriverActive(
  driverId: string,
  active: boolean
): Promise<AdminResult> {
  const ctx = await assertAdmin()
  if (!ctx) return { error: 'Not allowed.' }

  if (driverId === ctx.user.id && !active) {
    return { error: 'You cannot disable your own account.' }
  }

  const { error } = await ctx.supabase
    .from('profiles')
    .update({ is_active: active })
    .eq('id', driverId)

  if (error) return { error: 'Could not update that driver.' }

  revalidatePath('/admin', 'layout')
  return { ok: true }
}

export async function setDriverPlan(
  driverId: string,
  plan: 'FREE' | 'PRO' | 'BUSINESS'
): Promise<AdminResult> {
  const ctx = await assertAdmin()
  if (!ctx) return { error: 'Not allowed.' }

  const { error } = await ctx.supabase
    .from('profiles')
    .update({ plan })
    .eq('id', driverId)

  if (error) return { error: 'Could not change the plan.' }

  revalidatePath('/admin', 'layout')
  return { ok: true }
}

export async function deleteDriver(driverId: string): Promise<AdminResult> {
  const ctx = await assertAdmin()
  if (!ctx) return { error: 'Not allowed.' }

  if (driverId === ctx.user.id) {
    return { error: 'You cannot delete your own account here.' }
  }

  try {
    // Removing the auth user cascades to their profile, customers,
    // bookings, notifications and push subscriptions.
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(driverId)
    if (error) return { error: 'Could not delete that driver.' }
  } catch {
    return { error: 'Service key missing. Add SUPABASE_SERVICE_ROLE_KEY.' }
  }

  revalidatePath('/admin', 'layout')
  return { ok: true }
}
