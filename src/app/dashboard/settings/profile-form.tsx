'use client'

import { useActionState, useEffect, useState } from 'react'
import { saveProfile, checkSlug, type ProfileState } from './actions'
import { Field, TextArea, Alert, Submit } from '@/components/ui'

type Profile = {
  name: string | null
  slug: string
  phone: string | null
  whatsapp_phone: string | null
  business_name: string | null
  licence_number: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_registration: string | null
  service_area: string | null
  description: string | null
}

const initial: ProfileState = {}

export default function ProfileForm({
  profile,
  siteUrl,
}: {
  profile: Profile
  siteUrl: string
}) {
  const [state, action, pending] = useActionState(saveProfile, initial)
  const [slug, setSlug] = useState(profile.slug)
  const [slugState, setSlugState] = useState<{ ok: boolean; reason: string } | null>(null)

  useEffect(() => {
    if (slug === profile.slug) {
      setSlugState(null)
      return
    }
    const t = setTimeout(async () => {
      setSlugState(await checkSlug(slug))
    }, 400)
    return () => clearTimeout(t)
  }, [slug, profile.slug])

  return (
    <form action={action} className="space-y-6">
      {state.error ? <Alert kind="error">{state.error}</Alert> : null}
      {state.message ? <Alert kind="ok">{state.message}</Alert> : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          About you
        </h2>
        <Field label="Your name" name="name" defaultValue={profile.name ?? ''} required />
        <Field
          label="Business name"
          name="business_name"
          defaultValue={profile.business_name ?? ''}
          placeholder="Smith Cabs"
        />
        <Field
          label="Phone number"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={profile.phone ?? ''}
          required
          hint="This is the number your customers will call."
        />
        <Field
          label="WhatsApp number"
          name="whatsapp_phone"
          type="tel"
          inputMode="tel"
          defaultValue={profile.whatsapp_phone ?? ''}
          hint="Leave blank if it is the same as above, or if you would rather not show it."
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Your booking link
        </h2>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">
            Link
          </span>
          <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 focus-within:border-navy focus-within:ring-4 focus-within:ring-navy/10">
            <span className="shrink-0 text-sm text-slate-400">{siteUrl}/</span>
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              required
              className="w-full bg-transparent py-3 text-base outline-none"
            />
          </div>
        </label>
        {slugState ? (
          <p className={`text-sm ${slugState.ok ? 'text-emerald-700' : 'text-red-700'}`}>
            {slugState.reason}
          </p>
        ) : null}
        <p className="text-xs text-slate-400">
          This is what your QR code points at. Changing it breaks any QR
          codes you have already printed.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Your taxi
        </h2>
        <Field
          label="Licence number"
          name="licence_number"
          defaultValue={profile.licence_number ?? ''}
          placeholder="SPSV licence number"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Make" name="vehicle_make" defaultValue={profile.vehicle_make ?? ''} placeholder="Toyota" />
          <Field label="Model" name="vehicle_model" defaultValue={profile.vehicle_model ?? ''} placeholder="Prius" />
        </div>
        <Field
          label="Registration"
          name="vehicle_registration"
          defaultValue={profile.vehicle_registration ?? ''}
          placeholder="12-D-34567"
        />
        <Field
          label="Service area"
          name="service_area"
          defaultValue={profile.service_area ?? ''}
          placeholder="Dublin and surrounding areas"
        />
        <TextArea
          label="Short description"
          name="description"
          defaultValue={profile.description ?? ''}
          placeholder="Airport transfers, city rides, regular bookings."
        />
      </section>

      <Submit pending={pending}>Save profile</Submit>
    </form>
  )
}
