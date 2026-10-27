import { createAdminClient } from '@/lib/supabase/admin'

export type GoogleKeySource = 'database' | 'env' | 'none'

/**
 * The Google Maps/Places key, and where it actually came from. Prefers
 * whatever an admin has saved in Supabase (Admin → Settings) over the
 * GOOGLE_MAPS_SERVER_KEY env var, so it can be changed without a
 * redeploy. Falls back to the env var — never throws — if nothing is
 * saved yet, the settings table doesn't exist yet, or the service role
 * key isn't configured in this environment; the `source` return value is
 * what the admin Settings page uses to tell you which of those happened.
 */
export async function getGoogleMapsApiKeyWithSource(): Promise<{
  key: string | null
  source: GoogleKeySource
}> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('app_settings')
      .select('google_places_api_key')
      .eq('id', true)
      .maybeSingle()
    if (data?.google_places_api_key) {
      return { key: data.google_places_api_key as string, source: 'database' }
    }
  } catch {
    // No service role key configured, or the table doesn't exist yet —
    // fall through to the env var below either way.
  }
  const envKey = process.env.GOOGLE_MAPS_SERVER_KEY ?? null
  return { key: envKey, source: envKey ? 'env' : 'none' }
}

export async function getGoogleMapsApiKey(): Promise<string | null> {
  const { key } = await getGoogleMapsApiKeyWithSource()
  return key
}
