/* eslint-disable @next/next/no-img-element */
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

function TaxiIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.2 3.2h5.6c.5 0 .9.4.9.9v1.2h-7.4V4.1c0-.5.4-.9.9-.9z" />
      <path d="M5.6 8.1 6.9 6h10.2l1.3 2.1c1.3.2 2.2 1.3 2.2 2.6v4.7c0 .6-.5 1.1-1.1 1.1h-.7a2.3 2.3 0 0 1-4.5 0H9.7a2.3 2.3 0 0 1-4.5 0h-.7c-.6 0-1.1-.5-1.1-1.1v-4.7c0-1.3.9-2.4 2.2-2.6zm1.7.4-.8 2.4h11l-.8-2.4H7.3zM6 12.6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zm12 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2z" />
    </svg>
  )
}

function PhoneIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.6 3.2c.5 0 .9.3 1.1.7l1.4 3.2c.2.5.1 1-.3 1.3l-1.4 1.2a12.4 12.4 0 0 0 5 5l1.2-1.4c.3-.4.8-.5 1.3-.3l3.2 1.4c.4.2.7.6.7 1.1v3.2c0 .8-.6 1.4-1.4 1.4A16.8 16.8 0 0 1 3.2 4.6c0-.8.6-1.4 1.4-1.4h2z" />
    </svg>
  )
}

function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.66-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.7.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.12-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.89-9.89 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89M20.46 3.49A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.005c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.42" />
    </svg>
  )
}

function PersonIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4.3" />
      <path d="M3.8 21.6a8.2 8.2 0 0 1 16.4 0z" />
    </svg>
  )
}

function PinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2A6.8 6.8 0 0 0 5.2 9c0 4.9 6 12.3 6.2 12.6a.8.8 0 0 0 1.2 0c.3-.3 6.2-7.7 6.2-12.6A6.8 6.8 0 0 0 12 2.2zm0 9.4a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z" />
    </svg>
  )
}

function Chevron() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 5.5 15.5 12 9 18.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.3 4.6 5.2v6c0 4.5 3.1 8.7 7.4 10.5 4.3-1.8 7.4-6 7.4-10.5v-6z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z" />
    </svg>
  )
}

function SmileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.4a9.6 9.6 0 1 0 0 19.2 9.6 9.6 0 0 0 0-19.2zM8.6 8.4a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6zm6.8 0a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6zM12 17.6a5.2 5.2 0 0 1-4.5-2.6h9A5.2 5.2 0 0 1 12 17.6z" />
    </svg>
  )
}

function ActionRow({
  href,
  title,
  subtitle,
  icon,
  className,
  external,
  download,
}: {
  href: string
  title: string
  subtitle: string
  icon: ReactNode
  className: string
  external?: boolean
  download?: boolean
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(download ? { download: '' } : {})}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition active:scale-[0.99] ${className}`}
    >
      <span className="flex w-12 shrink-0 justify-center">{icon}</span>
      <span className="h-9 w-px shrink-0 bg-current opacity-25" aria-hidden="true" />
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[17px] font-bold leading-tight">{title}</span>
        <span className="block text-[13px] leading-tight opacity-80">
          {subtitle}
        </span>
      </span>
      <Chevron />
    </a>
  )
}

export default function DriverCardView({
  card,
  bookHref,
  qrSvg,
  shareUrl,
}: {
  card: DriverCard
  bookHref?: string
  qrSvg?: string
  shareUrl?: string
}) {
  const whatsapp = card.whatsapp_phone ?? null
  const first = card.name.split(' ')[0]
  const role = card.business_name ?? 'Professional taxi driver'

  // "Safe • Reliable • Friendly" by default; a driver's own description
  // splits on bullets or commas into up to three badges.
  const traits = (card.description ?? 'Safe • Reliable • Friendly')
    .split(/[•·|,]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3)

  const traitIcons = [<ShieldIcon key="s" />, <StarIcon key="r" />, <SmileIcon key="f" />]

  return (
    <div className="tc-in overflow-hidden rounded-[26px] bg-[#0B0B0C] shadow-[0_30px_70px_-28px_rgba(0,0,0,0.95)] ring-1 ring-white/10">
      {/* Header */}
      <div className="relative">
        <div className="absolute right-0 top-0 h-full w-[45%] rounded-bl-[44px] bg-yellow" />
        <div className="relative flex items-start justify-between gap-2 px-4 py-4">
          <div className="flex items-center gap-2.5 pt-1">
            <img
              src={LOGO_MARK}
              alt="TaxiCard"
              width={44}
              height={44}
              style={{ width: 44, height: 44 }}
              className="shrink-0"
            />
            <span className="leading-none">
              <span className="block text-[20px] font-bold tracking-tight">
                <span className="text-white">Taxi</span>
                <span className="text-yellow">Card</span>
              </span>
              <span className="mt-1 block text-[9px] font-semibold tracking-[0.2em] text-white/55">
                TAP. BOOK. RIDE.
              </span>
            </span>
          </div>

          <div className="max-w-[44%] pt-0.5 text-right text-navy">
            <p className="flex items-start justify-end gap-1 text-[13px] font-bold leading-tight">
              <span className="mt-px shrink-0">
                <PinIcon size={14} />
              </span>
              <span>
                Your local
                <br />
                taxi driver
              </span>
            </p>
            {card.service_area ? (
              <>
                <span className="my-1.5 ml-auto block h-px w-16 bg-navy/30" />
                <p className="text-[13px] font-medium leading-tight">
                  {card.service_area}
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="px-5 pt-3 text-center">
        {card.photo_url ? (
          <img
            src={card.photo_url}
            alt={card.name}
            width={116}
            height={116}
            className="mx-auto h-[116px] w-[116px] rounded-full object-cover ring-4 ring-yellow"
          />
        ) : null}

        <h1 className="tc-left mt-3 text-[27px] font-bold leading-tight text-white">
          {card.name}
        </h1>
        <p className="tc-left tc-d1 mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
          {role}
        </p>
        <span className="mx-auto mt-2.5 block h-[3px] w-16 rounded-full bg-yellow" />

        <div className="mt-3.5 flex items-stretch justify-center">
          {traits.map((t, i) => (
            <div key={t} className="flex items-center">
              {i > 0 ? (
                <span className="mx-3 h-6 w-px bg-white/15" aria-hidden="true" />
              ) : null}
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-white">
                <span className="text-yellow">{traitIcons[i]}</span>
                {t}
              </span>
            </div>
          ))}
        </div>

        {!card.is_available ? (
          <p className="mt-3 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/70">
            Not taking bookings right now.
          </p>
        ) : null}

        {card.welcome_message ? (
          <p className="mt-3 text-sm text-white/65">{card.welcome_message}</p>
        ) : null}
      </div>

      {/* Actions, stacked */}
      <div className="space-y-2.5 px-4 pb-4 pt-4">
        {card.is_available && bookHref ? (
          <ActionRow
            href={bookHref}
            title="Book My Taxi"
            subtitle="Quick and easy booking"
            icon={<TaxiIcon />}
            className="bg-yellow text-navy"
          />
        ) : null}

        {whatsapp ? (
          <ActionRow
            href={`https://wa.me/${whatsappNumber(whatsapp)}`}
            title="Chat on WhatsApp"
            subtitle="Message me directly"
            icon={<WhatsAppIcon />}
            className="bg-[#22A94F] text-white"
            external
          />
        ) : null}

        {card.phone ? (
          <ActionRow
            href={`tel:${card.phone.replace(/\s/g, '')}`}
            title={`Call ${first}`}
            subtitle="Tap to call now"
            icon={<PhoneIcon />}
            className="bg-[#2C7BE5] text-white"
          />
        ) : null}

        <ActionRow
          href={`/${card.slug}/vcard`}
          title="Save My Contact"
          subtitle="Add me to your phone"
          icon={<PersonIcon />}
          className="border border-white/12 bg-white/[0.06] text-white"
          download
        />
      </div>

      {/* Small share code */}
      {qrSvg && shareUrl ? (
        <div className="mx-4 mb-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center">
          <div
            className="mx-auto w-24 rounded-lg bg-white p-1.5"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="mt-2.5 text-[15px] font-bold text-white">Scan and save</p>
          <p className="mt-0.5 text-[12px] text-white/55">{shareUrl}</p>
        </div>
      ) : null}

      <div className="bg-yellow px-5 py-3 text-center">
        <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-navy">
          Same driver · Every journey
        </p>
      </div>

      {card.vehicle ? (
        <p className="bg-[#0B0B0C] px-5 py-2.5 text-center text-xs text-white/40">
          {card.vehicle}
        </p>
      ) : null}
    </div>
  )
}
