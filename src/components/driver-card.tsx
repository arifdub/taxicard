import Image from 'next/image'
import type { ReactNode } from 'react'
import { whatsappNumber } from '@/lib/phone'

export type DriverCard = {
  slug: string
  name: string
  business_name: string | null
  photo_url: string | null
  description: string | null
  service_area: string | null
  phone: string | null
  whatsapp_phone: string | null
  vehicle: string | null
  is_available: boolean
  welcome_message: string | null
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function DriverCardView({
  card,
  bookHref,
  qrSvg,
  shareUrl,
  avatar,
}: {
  card: DriverCard
  bookHref?: string
  qrSvg?: string
  shareUrl?: string
  avatar?: ReactNode
}) {
  const whatsapp = card.whatsapp_phone ?? null

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="bg-navy px-6 py-8 text-center">
        {avatar ?? (
          card.photo_url ? (
            <Image
              src={card.photo_url}
              alt={card.name}
              width={96}
              height={96}
              unoptimized
              className="mx-auto h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow text-2xl font-semibold text-navy">
              {initials(card.name)}
            </div>
          )
        )}

        <h1 className="mt-3 text-2xl font-semibold text-white">{card.name}</h1>
        {card.business_name ? (
          <p className="text-sm text-slate-300">{card.business_name}</p>
        ) : null}
        {card.service_area ? (
          <p className="mt-1 text-sm text-slate-300">{card.service_area}</p>
        ) : null}

        <span
          className={`mt-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold ${
            card.is_available
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-600 text-slate-200'
          }`}
        >
          {card.is_available
            ? 'Available for bookings'
            : 'Currently unavailable for bookings'}
        </span>
      </div>

      <div className="space-y-3 px-5 py-6">
        {card.welcome_message ? (
          <p className="text-center text-sm text-slate-600">
            {card.welcome_message}
          </p>
        ) : null}

        {card.is_available && bookHref ? (
          <a
            href={bookHref}
            className="block rounded-xl bg-yellow px-4 py-4 text-center text-lg font-semibold text-navy"
          >
            Book my taxi
          </a>
        ) : null}

        {!card.is_available ? (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-600">
            Not taking bookings right now, but you can still call.
          </p>
        ) : null}

        {card.phone ? (
          <a
            href={`tel:${card.phone.replace(/\s/g, '')}`}
            className="block rounded-xl border border-slate-200 px-4 py-3.5 text-center text-base font-medium"
          >
            Call {card.name.split(' ')[0]}
          </a>
        ) : null}

        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsappNumber(whatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-slate-200 px-4 py-3.5 text-center text-base font-medium text-emerald-800"
          >
            WhatsApp
          </a>
        ) : null}

        {card.description ? (
          <p className="pt-2 text-center text-sm text-slate-500">
            {card.description}
          </p>
        ) : null}

        {card.vehicle ? (
          <p className="text-center text-xs text-slate-400">{card.vehicle}</p>
        ) : null}
      </div>

      {qrSvg && shareUrl ? (
        <div className="border-t border-slate-100 px-5 py-5 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Pass {card.name.split(' ')[0]} on to a friend
          </p>
          <div
            className="mx-auto mt-3 w-32"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="mt-2 break-all text-xs text-slate-400">{shareUrl}</p>
        </div>
      ) : null}
    </div>
  )
}
