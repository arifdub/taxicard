import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, slug, phone, is_available')
    .eq('id', user.id)
    .single()

  const ready = Boolean(profile?.phone)
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
    .replace(/\/$/, '')

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-navy">
        Hello, {profile?.name ?? 'driver'}
      </h1>

      {!ready ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-medium text-amber-900">Add your phone number</p>
          <p className="mt-1 text-sm text-amber-800">
            Your card cannot go live without a number for customers to call.
          </p>
          <Link
            href="/dashboard/settings"
            className="mt-3 inline-block rounded-xl bg-yellow px-4 py-2.5 text-sm font-semibold text-navy"
          >
            Finish setup
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">Your booking link</p>
          <a
            href={`${siteUrl}/${profile?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-all text-base font-medium text-blue-700 underline"
          >
            {siteUrl}/{profile?.slug}
          </a>
          <Link
            href="/dashboard/card"
            className="mt-3 inline-block rounded-xl bg-yellow px-4 py-2.5 text-sm font-semibold text-navy"
          >
            My card and QR code
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">
          Bookings and customers appear here once the booking page is built.
        </p>
      </div>
    </div>
  )
}
