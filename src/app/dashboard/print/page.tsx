/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { siteUrl, prettyLink } from '@/lib/site'
import { LOGO_MARK } from '@/lib/brand'
import PrintButton from './print-button'

export const dynamic = 'force-dynamic'

export default async function PrintPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, slug, phone, business_name, service_area')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/dashboard/settings')

  const url = `${siteUrl()}/${profile.slug}`
  const pretty = prettyLink(profile.slug)
  const first = (profile.name ?? 'your driver').split(' ')[0]

  // High error correction so the code still scans with a fingerprint on
  // it, or a scuff from the back of a seat.
  const qr = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'H',
    color: { dark: '#000000', light: '#FFFFFF' },
  })

  return (
    <>
      <div className="no-print space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Print</h1>
          <p className="mt-1 text-sm text-slate-400">
            Two designs. Print, then choose Save as PDF if you are taking it
            to a print shop.
          </p>
        </div>

        <PrintButton />

        <div className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Before you print</p>
          <ul className="mt-2 space-y-1.5 text-slate-400">
            <li>Set paper to A4 and margins to Default.</li>
            <li>Turn on background graphics, or the yellow will vanish.</li>
            <li>Scan your own code off the paper before ordering a hundred.</li>
          </ul>
        </div>

        <Link href="/dashboard/card" className="block text-sm text-brandblue">
          Back to my card
        </Link>
      </div>

      {/* ---------- Sheet 1: the sign for the back of the seat ---------- */}
      <div className="print-sheet">
        <div className="sign">
          <div className="sign-head">
            <img src={LOGO_MARK} alt="" className="sign-logo" />
            <span className="sign-brand">
              Taxi<span className="brand-y">Card</span>
            </span>
          </div>

          <p className="sign-kicker">Need me again?</p>
          <h2 className="sign-title">Scan to book {first}</h2>

          <div
            className="sign-qr"
            dangerouslySetInnerHTML={{ __html: qr }}
          />

          <p className="sign-url">{pretty}</p>

          <div className="sign-foot">
            <p className="sign-name">{profile.name}</p>
            {profile.phone ? <p className="sign-phone">{profile.phone}</p> : null}
            <p className="sign-note">No app. No account. Two taps.</p>
          </div>
        </div>
      </div>

      {/* ---------- Sheet 2: business cards, 8 per page ---------- */}
      <div className="print-sheet">
        <div className="bc-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`f${i}`} className="bc bc-front">
              <div className="bc-head">
                <img src={LOGO_MARK} alt="" className="bc-logo" />
                <span className="bc-brand">
                  Taxi<span className="brand-y">Card</span>
                </span>
              </div>
              <p className="bc-name">{profile.name}</p>
              <p className="bc-role">
                {profile.business_name ?? 'Professional taxi driver'}
              </p>
              {profile.service_area ? (
                <p className="bc-area">{profile.service_area}</p>
              ) : null}
              {profile.phone ? <p className="bc-phone">{profile.phone}</p> : null}
            </div>
          ))}

          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`b${i}`} className="bc bc-back">
              <div
                className="bc-qr"
                dangerouslySetInnerHTML={{ __html: qr }}
              />
              <p className="bc-scan">Scan to book me</p>
              <p className="bc-url">{pretty}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
