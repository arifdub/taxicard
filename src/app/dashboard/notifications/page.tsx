import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { markAllRead, clearRead } from './actions'

export const dynamic = 'force-dynamic'

type Note = {
  id: string
  kind: string
  title: string
  body: string | null
  url: string | null
  read_at: string | null
  created_at: string
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('notifications')
    .select('id, kind, title, body, url, read_at, created_at')
    .eq('driver_id', user.id)
    .order('created_at', { ascending: false })
    .limit(60)

  const notes = (data as Note[] | null) ?? []
  const unread = notes.filter((n) => !n.read_at).length

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Notifications</h1>
          <p className="mt-1 text-sm text-slate-400">
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </p>
        </div>

        {unread > 0 ? (
          <form action={markAllRead}>
            <button className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white">
              Mark all read
            </button>
          </form>
        ) : null}
      </div>

      {notes.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-navy-soft p-4 text-sm text-slate-300">
          Nothing yet. Job alerts and messages from the office appear here.
        </p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => {
            const inner = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p
                    className={`text-base font-semibold ${
                      n.read_at ? 'text-slate-300' : 'text-white'
                    }`}
                  >
                    {n.title}
                  </p>
                  <span className="shrink-0 text-xs text-slate-500">
                    {new Date(n.created_at).toLocaleString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {n.body ? (
                  <p className="mt-1 text-sm text-slate-400">{n.body}</p>
                ) : null}
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                    n.kind === 'JOB'
                      ? 'bg-yellow/20 text-yellow'
                      : n.kind === 'MESSAGE'
                        ? 'bg-brandblue/20 text-brandblue'
                        : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {n.kind === 'JOB' ? 'job' : n.kind.toLowerCase()}
                </span>
              </>
            )

            const cls = `block rounded-2xl border p-4 ${
              n.read_at
                ? 'border-white/10 bg-navy-soft'
                : 'border-yellow/30 bg-yellow/[0.06]'
            }`

            return (
              <li key={n.id}>
                {n.url ? (
                  <Link href={n.url} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {notes.some((n) => n.read_at) ? (
        <form action={clearRead}>
          <button className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400">
            Clear read notifications
          </button>
        </form>
      ) : null}
    </div>
  )
}
