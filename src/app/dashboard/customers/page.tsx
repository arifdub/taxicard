import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { whatsappNumber, telHref } from '@/lib/phone'
import { AddCustomer } from './customer-form'

export const dynamic = 'force-dynamic'

type Row = {
  id: string
  name: string
  phone: string
  bookings_count: number
  last_booking_at: string | null
  favourite_pickup: string | null
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('customers')
    .select('id, name, phone, bookings_count, last_booking_at, favourite_pickup')

  if (q && q.trim()) {
    const term = q.trim()
    const digits = term.replace(/\D/g, '')
    query = digits.length >= 3
      ? query.or(`name.ilike.%${term}%,phone_key.ilike.%${digits}%`)
      : query.ilike('name', `%${term}%`)
  }

  const { data } = await query
    .order('last_booking_at', { ascending: false, nullsFirst: false })
    .limit(200)

  const customers = (data as Row[] | null) ?? []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Customers</h1>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search name or number"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
        />
        <button className="rounded-xl bg-navy px-4 text-sm font-medium text-white">
          Search
        </button>
      </form>

      <AddCustomer />

      {customers.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
          {q
            ? 'Nobody matches that.'
            : 'No customers yet. Anyone who books through your card is saved here automatically.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {customers.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <Link href={`/dashboard/customers/${c.id}`} className="min-w-0">
                  <p className="truncate text-base font-semibold text-navy">
                    {c.name}
                  </p>
                  <p className="text-sm text-slate-500">{c.phone}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {c.bookings_count} booking{c.bookings_count === 1 ? '' : 's'}
                    {c.last_booking_at
                      ? ` · last ${new Date(c.last_booking_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`
                      : ''}
                  </p>
                </Link>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href={telHref(c.phone)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-medium"
                >
                  Call
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber(c.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-center text-sm font-medium text-emerald-800"
                >
                  WhatsApp
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
