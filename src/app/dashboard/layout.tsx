import Link from 'next/link'
import NavMenu from './nav-menu'
import Wordmark from '@/components/wordmark'
import IncomingBooking from '@/components/incoming-booking'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
    isAdmin = Boolean(data?.is_admin)
  }

  return (
    <div className="tc-dark-page text-white">
      <header className="border-b border-white/10 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/dashboard">
            <Wordmark size="sm" />
          </Link>
          <NavMenu isAdmin={isAdmin} />
        </div>
      </header>

      <main className="tc-dark mx-auto w-full max-w-md px-5 py-6 pb-[calc(env(safe-area-inset-bottom)+3rem)]">
        {children}
      </main>

      {user ? <IncomingBooking driverId={user.id} /> : null}
    </div>
  )
}
