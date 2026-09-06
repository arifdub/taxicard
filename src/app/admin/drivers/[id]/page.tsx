import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { prettyLink } from '@/lib/site'
import DriverControls from './driver-controls'

export const dynamic = 'force-dynamic'

type Driver = {
  id: string
  name: string | null
  slug: string
  business_name: string | null
  email: string | null
  phone: string | null
  licence_number: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_registration: string | null
  service_area: string | null
  is_active: boolean
  is_available: boolean
  is_admin: boolean
  plan: string
  created_at: string
}

export default async function AdminDriverPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { supabase, user } = await requireAdmin()

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  const driver = data as Driver | null
  if (!driver) notFound()

  const [customers, bookings, lastBooking] = await Promise.all([
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('driver_id', id),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('driver_id', id),
    supabase
      .from('bookings')
      .select('created_at')
      .eq('driver_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const last = (lastBooking.data as { created_at: string } | null)?.created_at

  return (
    <div className="space-y-6">
      <Link href="/admin/drivers" className="text-sm text-slate-400">
        Back to drivers
      </Link>

      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">
          {driver.name ?? 'Unnamed driver'}
        </h1>
        <a
          href={`/${driver.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm text-brandblue"
        >
          {prettyLink(driver.slug)}
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Customers" value={customers.count ?? 0} />
        <Stat label="Bookings" value={bookings.count ?? 0} />
        <Stat
          label="Last booking"
          text={
            last
              ? new Date(last).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                })
              : 'None'
          }
        />
      </div>

      <div className="space-y-1 rounded-2xl border border-white/10 bg-navy-soft p-5 text-sm">
        <Row label="Email" value={driver.email} />
        <Row label="Phone" value={driver.phone} />
        <Row label="Licence" value={driver.licence_number} />
        <Row
          label="Vehicle"
          value={
            [driver.vehicle_make, driver.vehicle_model]
              .filter(Boolean)
              .join(' ') || null
          }
        />
        <Row label="Registration" value={driver.vehicle_registration} />
        <Row label="Service area" value={driver.service_area} />
        <Row
          label="Joined"
          value={new Date(driver.created_at).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        />
        <Row
          label="Status"
          value={
            !driver.is_active
              ? 'Disabled'
              : driver.is_available
                ? 'Available'
                : 'Offline'
          }
        />
      </div>

      {driver.is_admin ? (
        <p className="rounded-2xl border border-yellow/30 bg-yellow/10 p-4 text-sm text-yellow">
          This account is a platform administrator.
        </p>
      ) : null}

      <DriverControls
        driverId={driver.id}
        driverName={driver.name ?? 'this driver'}
        isActive={driver.is_active}
        isAdmin={driver.is_admin}
        isSelf={driver.id === user.id}
        plan={driver.plan}
      />

      <p className="text-xs text-slate-500">
        Their customers and bookings are not shown here on purpose. Admin can
        see counts, not another driver&apos;s customer list.
      </p>
    </div>
  )
}

function Stat({
  label,
  value,
  text,
}: {
  label: string
  value?: number
  text?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-soft p-4">
      <p className="text-xl font-semibold">{text ?? value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="text-right">{value ?? '—'}</span>
    </div>
  )
}
