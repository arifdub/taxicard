import Link from 'next/link'
import NavMenu from './nav-menu'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy px-5 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold text-white">
            TaxiCard
          </Link>
          <NavMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-md px-5 py-6 pb-12">{children}</main>
    </div>
  )
}
