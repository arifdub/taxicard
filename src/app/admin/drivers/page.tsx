import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

type Driver = {
  id: string
  name: string | null
  slug: string
  phone: string | null
  email: string | null
  is_active: boolean
  is_available: boolean
  plan: string
  created_at: string
}

export default async function AdminDrivers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const { supabase } = await requireAdmin()

  let query = supabase
    .from('profiles')
    .select('id, name, slug, phone, email, is_active, is_available, plan, created_at')

  if (q?.trim()) {
    const t = q.trim()
    query = query.or(`name.ilike.%${t}%,slug.ilike.%${t}%,email.ilike.%${t}%`)
  }

  const { data } = await query
    .order('created_at', { ascending: false })
    .limit(200)

  const drivers = (data as Driver[] | null) ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold md:text-3xl">Drivers</h1>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search name, link or email"
          className="w-full rounded-xl border px-3 py-3 text-base outline-none"
        />
        <button className="rounded-xl bg-yellow px-5 text-sm font-semibold text-navy">
          Search
        </button>
      </form>

      {drivers.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-navy-soft p-5 text-sm text-slate-400">
          {q ? 'Nobody matches that.' : 'No drivers yet.'}
        </p>
      ) : (
        <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-navy-soft">
          {drivers.map((d) => (
            <Link
              key={d.id}
              href={`/admin/drivers/${d.id}`}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{d.name ?? 'Unnamed'}</p>
                <p className="truncate text-sm text-slate-400">
                  /{d.slug}
                  {d.phone ? ` · ${d.phone}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    d.is_active && d.is_available
                      ? 'bg-emerald-400'
                      : d.is_active
                        ? 'bg-slate-500'
                        : 'bg-red-400'
                  }`}
                  aria-hidden="true"
                />
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {d.plan.toLowerCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Green means available for bookings, grey means offline, red means the
        account is disabled.
      </p>
    </div>
  )
}
