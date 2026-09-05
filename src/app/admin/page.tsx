import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

type Driver = {
  id: string
  name: string | null
  slug: string
  created_at: string
  is_active: boolean
  plan: string
}

export default async function AdminOverview() {
  const { supabase, name } = await requireAdmin()

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [drivers, active, customers, bookings, pending, today, recent] =
    await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_available', true)
        .eq('is_active', true),
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'PENDING'),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfDay.toISOString()),
      supabase
        .from('profiles')
        .select('id, name, slug, created_at, is_active, plan')
        .order('created_at', { ascending: false })
        .limit(8),
    ])

  const list = (recent.data as Driver[] | null) ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">
          Platform overview
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Signed in as {name ?? 'admin'}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Drivers" value={drivers.count ?? 0} />
        <Stat label="Available now" value={active.count ?? 0} />
        <Stat label="Customers" value={customers.count ?? 0} />
        <Stat label="Bookings, all time" value={bookings.count ?? 0} />
        <Stat label="Bookings today" value={today.count ?? 0} />
        <Stat
          label="Awaiting a driver"
          value={pending.count ?? 0}
          tone={(pending.count ?? 0) > 0 ? 'text-yellow' : undefined}
        />
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Newest drivers
          </h2>
          <Link href="/admin/drivers" className="text-sm text-brandblue">
            All drivers
          </Link>
        </div>

        <div className="mt-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-navy-soft">
          {list.length === 0 ? (
            <p className="p-5 text-sm text-slate-400">Nobody has signed up yet.</p>
          ) : (
            list.map((d) => (
              <Link
                key={d.id}
                href={`/admin/drivers/${d.id}`}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.name ?? 'Unnamed'}</p>
                  <p className="truncate text-sm text-slate-400">/{d.slug}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!d.is_active ? (
                    <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-300">
                      disabled
                    </span>
                  ) : null}
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
                    {d.plan.toLowerCase()}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-soft p-5">
      <p className={`text-3xl font-semibold ${tone ?? 'text-white'}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  )
}
