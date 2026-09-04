import Link from 'next/link'
import { logOut } from '@/app/auth/actions'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy px-5 py-4">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold text-white">
            TaxiCard
          </Link>
          <form action={logOut}>
            <button className="text-sm text-slate-300">Log out</button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-5 py-6 pb-24">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-md">
          <Link href="/dashboard" className="flex-1 py-3.5 text-center text-xs text-slate-600">
            Dashboard
          </Link>
          <Link href="/dashboard/card" className="flex-1 py-3.5 text-center text-xs text-slate-600">
            My card
          </Link>
          <Link href="/dashboard/settings" className="flex-1 py-3.5 text-center text-xs text-slate-600">
            Settings
          </Link>
        </div>
      </nav>
    </div>
  )
}
