import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusView, { type BookingStatus } from './status-view'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Your booking',
  // Keep this page out of search results. The token is unguessable, but
  // it should not end up in an index either.
  robots: { index: false, follow: false },
}

export default async function BookingStatusPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_booking_by_token', {
    p_token: token,
  })

  const booking = (data as BookingStatus | null) ?? null
  if (!booking) notFound()

  return (
    <main className="tc-dark-page w-full px-5 py-8 text-white">
      <div className="mx-auto w-full max-w-md">
        <StatusView token={token} initial={booking} />
      </div>
    </main>
  )
}
