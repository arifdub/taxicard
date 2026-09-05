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

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.66-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.7.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.12-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 012.89 6.99c0 5.45-4.43 9.89-9.88 9.89M20.46 3.49A11.8 11.8 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 005.69 1.45h.005c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 00-3.48-8.42" />
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
    <div className="tc-in overflow-hidden rounded-3xl bg-navy-soft shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
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

      <div className="space-y-3 border-t border-white/5 px-5 py-6">
        {card.welcome_message ? (
          <p className="text-center text-sm text-slate-300">
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
          <p className="rounded-xl bg-white/5 px-4 py-3 text-center text-sm text-slate-300">
            Not taking bookings right now, but you can still call.
          </p>
        ) : null}

        <div className="tc-in tc-d6 grid grid-cols-2 gap-3">
          {card.phone ? (
            <a
              href={`tel:${card.phone.replace(/\s/g, '')}`}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-[#1FA855] px-3 py-4 text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
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
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-[#25D366] px-3 py-4 text-sm font-semibold text-[#06301A] transition active:scale-[0.98]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30">
                <WhatsAppIcon />
              </span>
              WhatsApp
            </a>
          ) : null}
        </div>

        {card.description ? (
          <p className="pt-2 text-center text-sm text-slate-300">
            {card.description}
          </p>
        ) : null}

        {card.vehicle ? (
          <p className="text-center text-xs text-slate-400">{card.vehicle}</p>
        ) : null}
      </div>

      {qrSvg && shareUrl ? (
        <div className="border-t border-white/10 px-5 py-5 text-center">
          <p className="text-xs font-semibold text-slate-400">
            Pass {card.name.split(' ')[0]} on to a friend
          </p>
          <div
            className="mx-auto mt-3 w-32 rounded-xl bg-white p-2"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="mt-2 break-all text-xs text-slate-400">{shareUrl}</p>
        </div>
      ) : null}
    </div>
  )
}
