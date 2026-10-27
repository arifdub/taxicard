import { createAdminClient } from '@/lib/supabase/admin'

/**
 * The Google Maps/Places key. Prefers whatever an admin has saved in
 * Supabase (Admin → Settings) over the GOOGLE_MAPS_SERVER_KEY env var, so
 * it can be changed without a redeploy. Falls back to the env var — and
 * degrades to null, not an error — if nothing is saved yet, the settings
 * table doesn't exist yet, or the service role key isn't configured in
 * this environment.
 */
export async function getGoogleMapsApiKey(): Promise<string | null> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('app_settings')
      .select('google_places_api_key')
      .eq('id', true)
      .maybeSingle()
    if (data?.google_places_api_key) return data.google_places_api_key as string
  } catch {
    // Fall through to the env var below.
  }
  return process.env.GOOGLE_MAPS_SERVER_KEY ?? null
}
