'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { profileSchema, slugSchema } from '@/lib/validation/schemas'

export type ProfileState = { error?: string; message?: string }

export async function saveProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Your session expired. Log in again.' }

  const parsed = profileSchema.safeParse(
    Object.fromEntries(formData.entries())
  )
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { error: `${issue.path.join('.')}: ${issue.message}` }
  }

  // RLS restricts this to the driver's own row, and a trigger blocks any
  // attempt to change is_admin, is_active or plan. The eq() is belt and
  // braces, not the security boundary.
  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'That booking link is already taken. Try another.' }
    }
    if (error.message.includes('slug_reserved')) {
      return { error: 'That booking link is reserved. Try another.' }
    }
    if (error.code === '23514') {
      return { error: 'Check your booking link — lowercase letters, numbers and hyphens only.' }
    }
    return { error: 'Could not save. Try again.' }
  }

  revalidatePath('/dashboard', 'layout')
  return { message: 'Saved.' }
}

export async function checkSlug(slug: string) {
  const parsed = slugSchema.safeParse(slug)
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Their current slug should read as available to them.
  if (user) {
    const { data: mine } = await supabase
      .from('profiles')
      .select('slug')
      .eq('id', user.id)
      .single()
    if (mine?.slug === parsed.data) return { ok: true, reason: 'This is your current link' }
  }

  const { data, error } = await supabase.rpc('is_slug_available', {
    p_slug: parsed.data,
  })

  if (error) return { ok: false, reason: 'Could not check right now' }
  return data
    ? { ok: true, reason: 'Available' }
    : { ok: false, reason: 'Already taken' }
}
