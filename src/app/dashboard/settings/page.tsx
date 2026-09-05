import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prettyLink } from '@/lib/site'
import { EditablePhoto } from '../card/card-tools'
import ProfileForm from './profile-form'
import InstallPrompt from '../install-prompt'
import PushSetup from '../push-setup'

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
      'name, slug, phone, whatsapp_phone, business_name, licence_number, vehicle_make, vehicle_model, vehicle_registration, service_area, description, photo_url'
    )
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <p className="text-sm text-red-300">
        Your profile row is missing. Check that the handle_new_user trigger
        ran when you signed up.
      </p>
    )
  }

  const siteUrl = prettyLink('').replace(/\/$/, '')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          {welcome ? 'Welcome. Set up your card' : 'Profile'}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {welcome
            ? 'Fill this in and your booking page goes live.'
            : 'Your details as your customers will see them.'}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-navy-soft p-5 text-center">
        <EditablePhoto
          userId={user.id}
          photoUrl={profile.photo_url}
          name={profile.name ?? 'Driver'}
          tone="dark"
        />
        <p className="mt-3 text-xs text-slate-400">
          This is the photo your customers see on your card.
        </p>
      </div>

      <ProfileForm profile={profile} siteUrl={siteUrl} />

      <div className="space-y-4 border-t border-white/10 pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-yellow">
          App and alerts
        </h2>
        <InstallPrompt />
        <PushSetup />
      </div>
    </div>
  )
}
