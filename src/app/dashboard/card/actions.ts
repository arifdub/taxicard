'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function setAvailability(next: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in again.' }

  const { error } = await supabase
    .from('profiles')
    .update({ is_available: next })
    .eq('id', user.id)

  if (error) return { error: 'Could not change your status.' }

  revalidatePath('/dashboard', 'layout')
  return { ok: true }
}

export async function savePhotoUrl(url: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in again.' }

  // Only accept a URL from our own storage bucket, so this action cannot
  // be used to point a profile at an arbitrary site.
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/driver-media/`
  if (!url.startsWith(base)) return { error: 'That image was rejected.' }

  const { error } = await supabase
    .from('profiles')
    .update({ photo_url: url })
    .eq('id', user.id)

  if (error) return { error: 'Could not save your photo.' }

  revalidatePath('/dashboard', 'layout')
  return { ok: true }
}

export async function setShowPhoto(next: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in again.' }

  const { error } = await supabase
    .from('driver_settings')
    .update({ show_photo: next })
    .eq('driver_id', user.id)

  if (error) return { error: 'Could not change that.' }

  revalidatePath('/dashboard', 'layout')
  return { ok: true }
}
