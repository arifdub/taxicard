/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import type { ReactNode } from 'react'
import { whatsappNumber } from '@/lib/phone'
import { LOGO_MARK } from '@/lib/brand'

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

function TaxiIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.2 3.2h5.6c.5 0 .9.4.9.9v1.2h-7.4V4.1c0-.5.4-.9.9-.9z" />
      <path d="M5.6 8.1 6.9 6h10.2l1.3 2.1c1.3.2 2.2 1.3 2.2 2.6v4.7c0 .6-.5 1.1-1.1 1.1h-.7a2.3 2.3 0 0 1-4.5 0H9.7a2.3 2.3 0 0 1-4.5 0h-.7c-.6 0-1.1-.5-1.1-1.1v-4.7c0-1.3.9-2.4 2.2-2.6zm1.7.4-.8 2.4h11l-.8-2.4H7.3zM6 12.6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm12 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z" />
    </svg>
  )
}

function PhoneIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 3.2c.5 0 .9.3 1.1.7l1.4 3.2c.2.5.1 1-.3 1.3l-1.4 1.2a12.4 12.4 0 0 0 5 5l1.2-1.4c.3-.4.8-.5 1.3-.3l3.2 1.4c.4.2.7.6.7 1.1v3.2c0 .8-.6 1.4-1.4 1.4A16.8 16.8 0 0 1 3.2 4.6c0-.8.6-1.4 1.4-1.4h2z" />
    </svg>
  )
}

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.66-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.7.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.12-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89M20.46 3.49A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.005c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.42" />
    </svg>
  )
}

function PinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2A6.8 6.8 0 0 0 5.2 9c0 4.9 6 12.3 6.2 12.6a.8.8 0 0 0 1.2 0c.3-.3 6.2-7.7 6.2-12.6A6.8 6.8 0 0 0 12 2.2zm0 9.4a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-full w-full">
      <circle cx="12" cy="8.4" r="4.3" />
      <path d="M3.6 21.5a8.4 8.4 0 0 1 16.8 0z" />
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
  const first = card.name.split(' ')[0]
  const role = card.business_name ?? 'Professional taxi driver'
  const tagline = card.description ?? 'Safe · Reliable · Friendly'

  return (
    <div className="tc-in overflow-hidden rounded-[28px] bg-[#0B0B0C] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.95)] ring-1 ring-white/10">
      {/* Header: logo on black, service area on the yellow shoulder */}
      <div className="relative">
        <div className="absolute right-0 top-0 h-full w-[52%] rounded-bl-[56px] bg-yellow" />
        <div className="relative flex items-start justify-between gap-3 px-5 py-5">
          <img
            src={LOGO_MARK}
            alt="TaxiCard"
            style={{ height: 44, width: 44 }}
            className="shrink-0"
          />
          <div className="pt-0.5 text-right text-navy">
            <p className="text-[13px] font-bold leading-tight">
              Your local
              <br />
              taxi driver
            </p>
            {card.service_area ? (
              <p className="mt-1.5 flex items-start justify-end gap-1 text-[13px] font-medium leading-tight">
                <span className="mt-0.5 shrink-0">
                  <PinIcon size={14} />
                </span>
                {card.service_area}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="flex items-center gap-4 px-5 pt-1">
        <span className="shrink-0">
          {avatar ?? (
            <span className="block rounded-full ring-[3px] ring-white">
              {card.photo_url ? (
                <Image
                  src={card.photo_url}
                  alt={card.name}
                  width={88}
                  height={88}
                  unoptimized
                  className="h-[88px] w-[88px] rounded-full object-cover"
                />
              ) : (
                <span className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full bg-yellow p-3 text-navy">
                  <PersonIcon />
                </span>
              )}
            </span>
          )}
        </span>

        <div className="min-w-0">
          <h1 className="tc-left truncate text-[26px] font-bold leading-tight text-white">
            {card.name}
          </h1>
          <p className="tc-left tc-d1 mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85">
            {role}
          </p>
          <span className="mt-2 block h-[3px] w-12 rounded-full bg-yellow" />
          <p className="tc-left tc-d2 mt-2 text-sm text-white/80">{tagline}</p>
        </div>
      </div>

      <div className="px-5 pt-4">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
            card.is_available
              ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40'
              : 'bg-white/10 text-slate-300 ring-1 ring-white/15'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              card.is_available ? 'bg-emerald-400' : 'bg-slate-500'
            }`}
            aria-hidden="true"
          />
          {card.is_available ? 'Available for bookings' : 'Not taking bookings'}
        </span>
      </div>

      {card.welcome_message ? (
        <p className="px-5 pt-3 text-sm text-white/70">{card.welcome_message}</p>
      ) : null}

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2.5 px-5 pb-6 pt-4">
        {card.is_available && bookHref ? (
          <a
            href={bookHref}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-yellow px-2 py-4 text-navy transition active:scale-[0.98]"
          >
            <TaxiIcon size={26} />
            <span className="text-[13px] font-bold leading-tight">Book my taxi</span>
          </a>
        ) : (
          <span className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/8 px-2 py-4 text-white/50">
            <TaxiIcon size={26} />
            <span className="text-[13px] font-semibold leading-tight">Unavailable</span>
          </span>
        )}

        {card.phone ? (
          <a
            href={`tel:${card.phone.replace(/\s/g, '')}`}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#16A34A] px-2 py-4 text-white transition active:scale-[0.98]"
          >
            <PhoneIcon />
            <span className="text-[13px] font-bold leading-tight">Call {first}</span>
          </a>
        ) : null}

        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsappNumber(whatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#22C55E] px-2 py-4 text-white transition active:scale-[0.98]"
          >
            <WhatsAppIcon />
            <span className="text-[13px] font-bold leading-tight">WhatsApp</span>
          </a>
        ) : null}
      </div>

      {/* Share panel */}
      {qrSvg && shareUrl ? (
        <div className="rounded-t-[36px] bg-white px-5 pb-5 pt-6 text-center">
          <div
            className="mx-auto w-36 rounded-xl p-1.5 ring-2 ring-yellow"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="mt-3 text-base font-bold text-navy">
            Pass {first} on to a friend
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-600">{shareUrl}</p>
        </div>
      ) : null}

      <div className="bg-yellow px-5 py-3 text-center">
        <p className="text-[15px] font-bold italic text-navy">
          Get there together
        </p>
      </div>

      {card.vehicle ? (
        <p className="bg-[#0B0B0C] px-5 py-3 text-center text-xs text-white/45">
          {card.vehicle}
        </p>
      ) : null}
    </div>
  )
}
