import Link from 'next/link'
import { redirect } from 'next/navigation'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { siteUrl, prettyLink } from '@/lib/site'
import DriverCardView, { type DriverCard } from '@/components/driver-card'
import { AvailabilitySwitch, EditablePhoto, CopyLink } from './card-tools'

export const dynamic = 'force-dynamic'

export default async function MyCardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('slug, is_available, phone, name, photo_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/dashboard/settings')

  const url = `${siteUrl()}/${profile.slug}`
  const pretty = prettyLink(profile.slug)

  const { data: card } = await supabase.rpc('get_driver_card', {
    p_slug: profile.slug,
  })

  const svg = await QRCode.toString(url, {
    type: 'svg',
    margin: 1,
    color: { dark: '#0F1B33', light: '#FFFFFF' },
  })
  const png = await QRCode.toDataURL(url, { width: 1024, margin: 2 })
  const svgHref = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">My card</h1>
        <p className="mt-1 text-sm text-slate-400">
          This is what your customers see.
        </p>
      </div>

      <AvailabilitySwitch initial={profile.is_available} />

      {!profile.phone ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Add a phone number in{' '}
          <Link href="/dashboard/settings" className="font-medium underline">
            Profile
          </Link>{' '}
          so customers can reach you.
        </div>
      ) : null}

      {card ? (
        <DriverCardView
          card={card as DriverCard}
          bookHref={`/${profile.slug}/book`}
          avatar={
            <EditablePhoto
              userId={user.id}
              photoUrl={profile.photo_url}
              name={profile.name ?? 'Driver'}
            />
          }
        />
      ) : null}

      <section className="space-y-3 rounded-2xl border border-white/10 bg-navy-soft p-4">
        <h2 className="text-sm font-semibold text-slate-400">Your QR code</h2>
        <div
          className="mx-auto w-48"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="break-all text-center text-base font-semibold text-white">
          {pretty}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={png}
            download={`taxicard-${profile.slug}.png`}
            className="rounded-xl bg-yellow px-3 py-3 text-center text-sm font-semibold text-white"
          >
            Download PNG
          </a>
          <a
            href={svgHref}
            download={`taxicard-${profile.slug}.svg`}
            className="rounded-xl border border-white/10 px-3 py-3 text-center text-sm font-medium"
          >
            Download SVG
          </a>
        </div>
        <CopyLink url={url} />
        <p className="text-xs text-slate-400">
          Use the PNG for printing on business cards. The SVG stays sharp at
          any size, which suits large signs or window stickers.
        </p>
      </section>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-white/10 bg-navy-soft px-4 py-3 text-center text-sm font-medium text-brandblue"
      >
        Open my public card
      </a>
    </div>
  )
}
