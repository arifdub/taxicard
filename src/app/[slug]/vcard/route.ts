import { createClient } from '@/lib/supabase/server'
import { siteUrl } from '@/lib/site'

type Card = {
  name: string
  business_name: string | null
  phone: string | null
  whatsapp_phone: string | null
  service_area: string | null
  slug: string
}

function escape(v: string) {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,')
}

/**
 * A contact file the passenger's phone will offer to save. Only includes
 * the number if the driver has chosen to show it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_driver_card', { p_slug: slug })
  const card = data as Card | null

  if (!card) return new Response('Not found', { status: 404 })

  const url = `${siteUrl()}/${card.slug}`
  const parts = card.name.trim().split(/\s+/)
  const last = parts.length > 1 ? parts[parts.length - 1] : ''
  const firstNames = parts.length > 1 ? parts.slice(0, -1).join(' ') : card.name

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escape(last)};${escape(firstNames)};;;`,
    `FN:${escape(card.name)}`,
  ]

  if (card.business_name) lines.push(`ORG:${escape(card.business_name)}`)
  lines.push('TITLE:Taxi driver')
  if (card.phone) lines.push(`TEL;TYPE=CELL,VOICE:${card.phone.replace(/\s/g, '')}`)
  if (card.whatsapp_phone && card.whatsapp_phone !== card.phone) {
    lines.push(`TEL;TYPE=CELL:${card.whatsapp_phone.replace(/\s/g, '')}`)
  }
  lines.push(`URL:${url}`)
  if (card.service_area) lines.push(`ADR;TYPE=WORK:;;;${escape(card.service_area)};;;`)
  lines.push(`NOTE:Book a taxi any time at ${url}`)
  lines.push('END:VCARD')

  const filename = card.slug.replace(/[^a-z0-9-]/g, '') || 'taxicard'

  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.vcf"`,
      'Cache-Control': 'no-store',
    },
  })
}
