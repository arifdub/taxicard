import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import Wordmark from '@/components/wordmark'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="tc-dark-page text-white">
      <header className="border-b border-white/10">
        <div className="tc-safe-top mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 pb-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Wordmark size="sm" />
            <span className="rounded-full bg-yellow px-2.5 py-0.5 text-xs font-semibold text-navy">
              Admin
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium"
          >
            My dashboard
          </Link>
        </div>

        <nav className="mx-auto flex max-w-5xl gap-1 px-3 pb-2">
          <Link
            href="/admin"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300"
          >
            Overview
          </Link>
          <Link
            href="/admin/drivers"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300"
          >
            Drivers
          </Link>
        </nav>
      </header>

      <main className="tc-dark mx-auto w-full max-w-5xl px-5 py-8">{children}</main>
    </div>
  )
}
