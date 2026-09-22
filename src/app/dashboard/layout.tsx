import Link from 'next/link'
import NavMenu from './nav-menu'
import NotificationBell from '@/components/notification-bell'
import TabBar from '@/components/tab-bar'
import Wordmark from '@/components/wordmark'
import IncomingBooking from '@/components/incoming-booking'
import ThemeToggle from '@/components/theme-toggle'
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
  let openJobs = 0
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

    if (isBusiness) {
      const { count: open } = await supabase
        .from('dispatch_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'OPEN')
      openJobs = open ?? 0
    }
  }

  return (
    <div id="tc-app-shell" className="tc-dark-page text-white light:text-navy">
      {/* Applies a saved day-theme preference before paint, scoped to this
          element only so the public site never inherits it. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(localStorage.getItem('tc-theme')==='light'){document.currentScript.parentElement.setAttribute('data-theme','light')}}catch(e){}",
        }}
      />
      <header className="border-b border-white/10 light:border-slate-200 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/dashboard" className="min-w-0">
            <Wordmark size="sm" />
            <span className="mt-0.5 block text-[11px] font-medium text-slate-400 light:text-slate-500">
              Driver app
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell initial={unread} />
            <NavMenu
              isAdmin={isAdmin}
              isBusiness={isBusiness}
              canDispatch={canDispatch}
            />
          </div>
        </div>
      </header>

      <main className="tc-dark mx-auto w-full max-w-md px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+6.5rem)]">
        {children}
      </main>

      <TabBar showJobs={isBusiness || canDispatch} jobCount={openJobs} />

      {user ? <IncomingBooking driverId={user.id} /> : null}
    </div>
  )
}
