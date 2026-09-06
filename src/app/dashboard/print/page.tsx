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
    .select('name, slug')
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
      <div className="no-print">
        <h1 className="text-2xl font-semibold text-white">Print</h1>
        <p className="mb-4 mt-1 text-sm text-slate-400">
          One page with your QR code, for the back of a seat or a business
          card. This is exactly what comes out.
        </p>
      </div>

      <div className="print-preview">
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

            <div className="sign-qr" dangerouslySetInnerHTML={{ __html: qr }} />

            <p className="sign-url">{pretty}</p>

            <div className="sign-foot">
              <p className="sign-name">{profile.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="no-print space-y-4 pt-4">
        <PrintButton />

        <div className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Before you print</p>
          <ul className="mt-2 space-y-1.5 text-slate-400">
            <li>One page. Any paper size works — the design scales.</li>
            <li>Turn on background graphics, or the yellow border vanishes.</li>
            <li>Card or photo paper holds up better in a car.</li>
            <li>Scan your own code off the paper before ordering a batch.</li>
          </ul>
        </div>

        <Link href="/dashboard/card" className="block text-sm text-brandblue">
          Back to my card
        </Link>
      </div>
    </>
  )
}
