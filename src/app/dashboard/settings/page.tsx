import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './profile-form'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const { welcome } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'name, slug, phone, whatsapp_phone, business_name, licence_number, vehicle_make, vehicle_model, vehicle_registration, service_area, description'
    )
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <p className="text-sm text-red-700">
        Your profile row is missing. Check that the handle_new_user trigger
        ran when you signed up.
      </p>
    )
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'taxicard.ie').replace(
    /^https?:\/\//,
    ''
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-navy">
          {welcome ? 'Welcome. Set up your card' : 'Settings'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {welcome
            ? 'Fill this in and your booking page goes live.'
            : 'Your details as your customers will see them.'}
        </p>
      </div>

      <ProfileForm profile={profile} siteUrl={siteUrl} />
    </div>
  )
}
