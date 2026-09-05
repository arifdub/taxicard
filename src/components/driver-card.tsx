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

function TaxiIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.2 3.2h5.6c.5 0 .9.4.9.9v1.2h-7.4V4.1c0-.5.4-.9.9-.9z" />
      <path d="M5.6 8.1 6.9 6h10.2l1.3 2.1c1.3.2 2.2 1.3 2.2 2.6v4.7c0 .6-.5 1.1-1.1 1.1h-.7a2.3 2.3 0 0 1-4.5 0H9.7a2.3 2.3 0 0 1-4.5 0h-.7c-.6 0-1.1-.5-1.1-1.1v-4.7c0-1.3.9-2.4 2.2-2.6zm1.7.4-.8 2.4h11l-.8-2.4H7.3zM6 12.6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm12 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 3.2c.5 0 .9.3 1.1.7l1.4 3.2c.2.5.1 1-.3 1.3l-1.4 1.2a12.4 12.4 0 0 0 5 5l1.2-1.4c.3-.4.8-.5 1.3-.3l3.2 1.4c.4.2.7.6.7 1.1v3.2c0 .8-.6 1.4-1.4 1.4A16.8 16.8 0 0 1 3.2 4.6c0-.8.6-1.4 1.4-1.4h2z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.66-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.7.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.12-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89M20.46 3.49A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.005c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.42" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2a6.8 6.8 0 0 0-6.8 6.8c0 4.9 6 12.3 6.2 12.6a.8.8 0 0 0 1.2 0c.3-.3 6.2-7.7 6.2-12.6A6.8 6.8 0 0 0 12 2.2zm0 9.4a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 12h15M13.5 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BrandRow() {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <span className="flex h-10 w-10 -rotate-6 items-center justify-center rounded-xl bg-yellow text-navy shadow-[0_6px_18px_-6px_rgba(255,199,44,0.8)]">
        <TaxiIcon size={22} />
      </span>
      <span className="text-[22px] font-bold tracking-tight">
        <span className="text-white">Taxi</span>
        <span className="text-yellow">Card</span>
        <span className="text-slate-400">.ie</span>
      </span>
    </div>
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
    <div className="tc-in overflow-hidden rounded-[28px] border border-white/10 bg-[#0E1116] px-4 py-5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)]">
      <BrandRow />

      <div className="mt-4 text-center">
        {avatar ?? (
          <span className="inline-block rounded-full p-[3px] ring-2 ring-yellow">
            {card.photo_url ? (
              <Image
                src={card.photo_url}
                alt={card.name}
                width={104}
                height={104}
                unoptimized
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow text-3xl font-bold text-navy">
                {initials(card.name)}
              </span>
            )}
          </span>
        )}

        <h1 className="tc-left tc-d1 mt-3 text-[26px] font-bold leading-tight text-white">
          {card.name}
        </h1>

        {card.business_name ? (
          <p className="tc-left tc-d2 mt-0.5 text-sm text-slate-400">
            {card.business_name}
          </p>
        ) : null}

        {card.service_area ? (
          <p className="tc-left tc-d3 mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-300">
            <span className="text-yellow">
              <PinIcon />
            </span>
            {card.service_area}
          </p>
        ) : null}

        <span
          className={`tc-in tc-d4 mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            card.is_available
              ? 'bg-emerald-500/15 text-white ring-1 ring-emerald-400/40'
              : 'bg-white/5 text-slate-300 ring-1 ring-white/15'
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              card.is_available ? 'bg-emerald-400' : 'bg-slate-500'
            }`}
            aria-hidden="true"
          />
          {card.is_available
            ? 'Available for bookings'
            : 'Not taking bookings right now'}
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {card.welcome_message ? (
          <p className="text-center text-sm text-slate-400">
            {card.welcome_message}
          </p>
        ) : null}

        {card.is_available && bookHref ? (
          <a
            href={bookHref}
            className="tc-in tc-d5 flex items-center justify-between gap-3 rounded-2xl bg-yellow px-6 py-4 text-navy shadow-[0_14px_34px_-12px_rgba(255,199,44,0.85)] transition active:scale-[0.99]"
          >
            <TaxiIcon size={26} />
            <span className="text-lg font-bold">Book My Taxi</span>
            <ArrowIcon />
          </a>
        ) : (
          <p className="rounded-2xl bg-white/5 px-4 py-3.5 text-center text-sm text-slate-300">
            Not taking bookings right now, but you can still call.
          </p>
        )}

        <div className="tc-in tc-d6 grid grid-cols-2 gap-3">
          {card.phone ? (
            <a
              href={`tel:${card.phone.replace(/\s/g, '')}`}
              className="flex items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-white/5 px-3 py-3 text-base font-semibold text-white transition active:scale-[0.98]"
            >
              <PhoneIcon />
              Call
            </a>
          ) : null}

          {whatsapp ? (
            <a
              href={`https://wa.me/${whatsappNumber(whatsapp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-[#22C55E] px-3 py-3 text-base font-semibold text-white transition active:scale-[0.98]"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          ) : null}
        </div>

        {card.description ? (
          <p className="text-center text-sm text-slate-400">
            {card.description}
          </p>
        ) : null}
      </div>

      {qrSvg && shareUrl ? (
        <div className="mt-5 border-t border-white/10 pt-5 text-center">
          <div
            className="mx-auto w-32 rounded-2xl bg-white p-2.5"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="mt-2.5 text-sm text-slate-300">Share code with friends</p>
          <p className="mt-0.5 text-xs text-slate-500">{shareUrl}</p>
        </div>
      ) : null}

      {card.vehicle ? (
        <p className="mt-4 text-center text-xs text-slate-500">{card.vehicle}</p>
      ) : null}
    </div>
  )
}
