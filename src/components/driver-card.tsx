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

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1.1 1A16 16 0 014 5.1 1 1 0 015 4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 11.5a7.9 7.9 0 01-11.6 7L4 20l1.6-4.6a7.9 7.9 0 1114.9-3.9z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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
    <div className="tc-in overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_-20px_rgba(15,27,51,0.45)] ring-1 ring-black/5">
      <div className="tc-hero px-6 py-9 text-center">
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

        <h1 className="tc-left tc-d1 mt-3 text-2xl font-semibold text-white">
          {card.name}
        </h1>
        {card.business_name ? (
          <p className="tc-left tc-d2 text-sm text-slate-300">{card.business_name}</p>
        ) : null}
        {card.service_area ? (
          <p className="tc-left tc-d3 mt-1 text-sm text-slate-300">{card.service_area}</p>
        ) : null}

        <span
          className={`tc-in tc-d4 mt-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold ${
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
            className="tc-in tc-d5 block rounded-2xl bg-yellow px-4 py-4 text-center text-lg font-semibold text-navy shadow-[0_10px_24px_-10px_rgba(255,199,44,0.9)] transition active:scale-[0.99]"
          >
            Book my taxi
          </a>
        ) : null}

        {!card.is_available ? (
          <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-600">
            Not taking bookings right now, but you can still call.
          </p>
        ) : null}

        <div className="tc-in tc-d6 grid grid-cols-2 gap-3">
          {card.phone ? (
            <a
              href={`tel:${card.phone.replace(/\s/g, '')}`}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-sm font-semibold text-navy transition active:scale-[0.98]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy">
                <PhoneIcon />
              </span>
              Call {card.name.split(' ')[0]}
            </a>
          ) : null}

          {whatsapp ? (
            <a
              href={`https://wa.me/${whatsappNumber(whatsapp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-4 text-sm font-semibold text-emerald-900 transition active:scale-[0.98]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                <ChatIcon />
              </span>
              Message on WhatsApp
            </a>
          ) : null}
        </div>

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
