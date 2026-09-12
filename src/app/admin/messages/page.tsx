import { requireAdmin } from '@/lib/admin'
import MessageForm from './message-form'

export const dynamic = 'force-dynamic'

type Sent = {
  id: string
  title: string
  body: string | null
  created_at: string
  read_at: string | null
}

export default async function MessagesPage() {
  const { supabase, user } = await requireAdmin()

  const { data } = await supabase
    .from('notifications')
    .select('id, title, body, created_at, read_at')
    .eq('kind', 'MESSAGE')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  const rows = (data as Sent[] | null) ?? []

  // Group the per-driver rows back into the messages that created them.
  const grouped = new Map<
    string,
    { title: string; body: string | null; at: string; total: number; read: number }
  >()

  for (const r of rows) {
    const key = `${r.title}|${r.body ?? ''}|${r.created_at.slice(0, 16)}`
    const g = grouped.get(key) ?? {
      title: r.title,
      body: r.body,
      at: r.created_at,
      total: 0,
      read: 0,
    }
    g.total += 1
    if (r.read_at) g.read += 1
    grouped.set(key, g)
  }

  const messages = [...grouped.values()]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Messages</h1>
        <p className="mt-1 text-sm text-slate-400">
          Send a note to your drivers. It lands in their notifications and on
          their phone.
        </p>
      </div>

      <MessageForm />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Sent
        </h2>

        {messages.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
            Nothing sent yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {messages.map((m) => (
              <li
                key={m.at + m.title}
                className="rounded-2xl border border-white/10 bg-navy-soft p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-white">{m.title}</p>
                  <span className="shrink-0 text-xs text-slate-500">
                    {new Date(m.at).toLocaleString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {m.body ? (
                  <p className="mt-1 text-sm text-slate-400">{m.body}</p>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">
                  {m.total} driver{m.total === 1 ? '' : 's'} · {m.read} read
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
