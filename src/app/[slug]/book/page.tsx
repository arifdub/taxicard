import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type DriverCard } from '@/components/driver-card'
import BookingForm from './booking-form'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return {
    title: 'Book a taxi',
    manifest: `/api/manifest?slug=${encodeURIComponent(slug)}`,
  }
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_driver_card', { p_slug: slug })
  const card = (data as DriverCard | null) ?? null
  if (!card) notFound()

  if (!card.is_available) {
    return (
      <main className="tc-dark-page w-full px-5 pb-10 text-center text-white pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-xl font-semibold text-white">
          {card.name} is not taking bookings right now
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          You can still ring, or check back shortly.
        </p>
        {card.phone ? (
          <a
            href={`tel:${card.phone.replace(/\s/g, '')}`}
            className="mt-6 block rounded-xl bg-yellow px-4 py-3.5 font-semibold text-navy"
          >
            Call {card.name.split(' ')[0]}
          </a>
        ) : null}
        <a
          href={`/${slug}`}
          className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to card
        </a>
        </div>
      </main>
    )
  }

  return (
    <main className="tc-dark-page w-full px-5 pb-8 text-white pt-[calc(env(safe-area-inset-top)+1.25rem)]">
      <div className="tc-dark mx-auto w-full max-w-md">
        <a
          href={`/${slug}`}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to card
        </a>
        <h1 className="tc-left mt-3 text-2xl font-semibold text-white">
          Book {card.name.split(' ')[0]}
        </h1>
        <p className="tc-left tc-d1 mb-6 mt-1 text-sm text-slate-400">
          No account needed. Two minutes.
        </p>

        <BookingForm slug={slug} driverName={card.name} />
      </div>
    </main>
  )
}
