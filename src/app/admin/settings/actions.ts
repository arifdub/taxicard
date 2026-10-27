'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type SettingsState = { error?: string; message?: string }

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

  return data?.is_admin ? { supabase } : null
}

export async function updateGoogleApiKey(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const ctx = await assertAdmin()
  if (!ctx) return { error: 'Not allowed.' }

  const key = String(formData.get('google_places_api_key') ?? '').trim()

  const { error } = await ctx.supabase
    .from('app_settings')
    .update({ google_places_api_key: key || null })
    .eq('id', true)

  if (error) {
    if (error.message.includes('does not exist') || error.code === '42P01') {
      return {
        error:
          'The settings table is missing. Run the app_settings migration in Supabase first.',
      }
    }
    return { error: 'Could not save that key.' }
  }

  revalidatePath('/admin/settings')
  return { message: key ? 'Key saved.' : 'Key cleared — falling back to the environment variable.' }
}
