import { requireAdmin } from '@/lib/admin'
import { getGoogleMapsApiKeyWithSource } from '@/lib/settings'
import GoogleKeyForm from './google-key-form'

export const dynamic = 'force-dynamic'

function mask(key: string): string {
  if (key.length <= 8) return '••••••••'
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`
}

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin()

  const { data } = await supabase
    .from('app_settings')
    .select('google_places_api_key')
    .eq('id', true)
    .maybeSingle()

  const key = (data as { google_places_api_key: string | null } | null)
    ?.google_places_api_key

  // Same helper the actual geocoding/autocomplete calls use, so this page
  // shows what is genuinely active — not just what is saved in the row
  // above, which can differ if the service role key is missing here.
  const { source } = await getGoogleMapsApiKeyWithSource()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Platform-wide configuration, not tied to any one driver.
        </p>
      </div>

      <GoogleKeyForm masked={key ? mask(key) : null} source={source} />
    </div>
  )
}
