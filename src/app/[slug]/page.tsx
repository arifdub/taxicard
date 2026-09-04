import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { siteUrl, prettyLink } from '@/lib/site'
import DriverCardView, { type DriverCard } from '@/components/driver-card'

// Always fresh: a driver flipping their availability should show up
// immediately, not after a cache expires.
export const dynamic = 'force-dynamic'

async function getCard(slug: string): Promise<DriverCard | null> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_driver_card', { p_slug: slug })
  return (data as DriverCard | null) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const card = await getCard(slug)
  if (!card) return { title: 'Not found' }

  const title = card.business_name
    ? `${card.name} — ${card.business_name}`
    : `${card.name} — taxi`

  return {
    title,
    description:
      card.description ?? `Book ${card.name} directly. No app needed.`,
    openGraph: { title, images: card.photo_url ? [card.photo_url] : [] },
  }
}

export default async function PublicCardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const card = await getCard(slug)
  if (!card) notFound()

  const shareUrl = `${siteUrl()}/${slug}`
  const qrSvg = await QRCode.toString(shareUrl, {
    type: 'svg',
    margin: 1,
    color: { dark: '#0F1B33', light: '#FFFFFF' },
  })

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <DriverCardView
        card={card}
        bookHref={`/${slug}/book`}
        qrSvg={qrSvg}
        shareUrl={prettyLink(slug)}
      />
      <p className="mt-6 text-center text-xs text-slate-400">
        Powered by TaxiCard
      </p>
    </main>
  )
}
