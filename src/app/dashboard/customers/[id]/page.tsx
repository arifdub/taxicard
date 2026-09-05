import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { whatsappNumber, telHref } from '@/lib/phone'
import { EditCustomer, DeleteCustomer } from '../customer-form'

export const dynamic = 'force-dynamic'

type Customer = {
  id: string
  name: string
  phone: string
  email: string | null
  notes: string | null
  favourite_pickup: string | null
  bookings_count: number
  last_booking_at: string | null
}

type Booking = {
  id: string
  status: string
  pickup_address: string
  destination_address: string | null
  booking_type: string
  scheduled_at: string | null
  created_at: string
}

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('customers')
    .select('id, name, phone, email, notes, favourite_pickup, bookings_count, last_booking_at')
    .eq('id', id)
    .maybeSingle()

  const customer = data as Customer | null
  if (!customer) notFound()

  const { data: rows } = await supabase
    .from('bookings')
    .select('id, status, pickup_address, destination_address, booking_type, scheduled_at, created_at')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  const bookings = (rows as Booking[] | null) ?? []

  return (
    <div className="space-y-5">
      <Link href="/dashboard/customers" className="text-sm text-slate-400">
        Back to customers
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-white">{customer.name}</h1>
        <p className="text-sm text-slate-400">
          {customer.bookings_count} booking
          {customer.bookings_count === 1 ? '' : 's'}
          {customer.last_booking_at
            ? ` · last ${new Date(customer.last_booking_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`
            : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={telHref(customer.phone)}
          className="rounded-xl bg-yellow px-4 py-3.5 text-center font-semibold text-white"
        >
          Call {customer.name.split(' ')[0]}
        </a>
        <a
          href={`https://wa.me/${whatsappNumber(customer.phone)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-white/10 bg-navy-soft px-4 py-3.5 text-center font-medium text-emerald-300"
        >
          WhatsApp
        </a>
      </div>

      <div className="space-y-2 rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm">
        <Row label="Phone" value={customer.phone} />
        {customer.email ? <Row label="Email" value={customer.email} /> : null}
        {customer.favourite_pickup ? (
          <Row label="Usual pickup" value={customer.favourite_pickup} />
        ) : null}
        {customer.notes ? (
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-400">Private notes</p>
            <p className="mt-1">{customer.notes}</p>
          </div>
        ) : null}
      </div>

      <EditCustomer
        id={customer.id}
        values={{
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          favourite_pickup: customer.favourite_pickup,
          notes: customer.notes,
        }}
      />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-400">Booking history</h2>
        {bookings.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-400">
            No bookings yet.
          </p>
        ) : (
          <ul className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-navy-soft">
            {bookings.map((b) => (
              <li key={b.id} className="p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">
                    {new Date(b.scheduled_at ?? b.created_at).toLocaleDateString(
                      undefined,
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    )}
                  </span>
                  <span className="text-slate-400">{b.status.toLowerCase()}</span>
                </div>
                <p className="mt-1 text-slate-300">
                  {b.pickup_address}
                  {b.destination_address ? ` to ${b.destination_address}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DeleteCustomer id={customer.id} name={customer.name} />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}
