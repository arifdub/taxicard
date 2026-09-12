import Link from 'next/link'
import NavMenu from './nav-menu'
import NotificationBell from '@/components/notification-bell'
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
  let isBusiness = false
  let canDispatch = false
  let unread = 0
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('is_admin, is_business, can_dispatch')
      .eq('id', user.id)
      .maybeSingle()
    isAdmin = Boolean(data?.is_admin)
    isBusiness = Boolean(data?.is_business)
    canDispatch = Boolean(data?.can_dispatch)

    const { data: count } = await supabase.rpc('unread_notification_count')
    unread = typeof count === 'number' ? count : 0
  }

  return (
    <div className="tc-dark-page text-white">
      <header className="border-b border-white/10 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/dashboard">
            <Wordmark size="sm" />
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell initial={unread} />
            <NavMenu
              isAdmin={isAdmin}
              isBusiness={isBusiness}
              canDispatch={canDispatch}
            />
          </div>
        </div>
      </header>

      <main className="tc-dark mx-auto w-full max-w-md px-5 py-6 pb-[calc(env(safe-area-inset-bottom)+3rem)]">
        {children}
      </main>

      {user ? <IncomingBooking driverId={user.id} /> : null}
    </div>
  )
}
