'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getGoogleMapsApiKeyWithSource } from '@/lib/settings'
import { placesAutocomplete } from '@/lib/places'

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

export type TestState = { error?: string; message?: string }

/**
 * Fires a real autocomplete request with whatever key is actually active
 * right now, and surfaces Google's own status — so "it's not working"
 * becomes a specific, fixable reason instead of a guess, without anyone
 * needing to dig through Vercel function logs.
 */
export async function testGoogleApiKey(): Promise<TestState> {
  const ctx = await assertAdmin()
  if (!ctx) return { error: 'Not allowed.' }

  const { key, source } = await getGoogleMapsApiKeyWithSource()
  const sourceLabel =
    source === 'database'
      ? 'the key saved here'
      : source === 'env'
        ? 'the GOOGLE_MAPS_SERVER_KEY environment variable'
        : 'no key at all'

  if (!key) {
    return { error: `Nothing to test — currently using ${sourceLabel}.` }
  }

  const result = await placesAutocomplete(key, 'Dublin Airport')

  if (result.ok) {
    const count = result.suggestions.length
    return {
      message: `Working, via ${sourceLabel}. Got ${count} suggestion${count === 1 ? '' : 's'} for "Dublin Airport".`,
    }
  }

  return {
    error: `Google rejected the request (via ${sourceLabel}): ${result.message}. In Google Cloud Console, make sure "Places API (New)" is enabled for this key, billing is active, and any key restrictions allow server-side calls.`,
  }
}
