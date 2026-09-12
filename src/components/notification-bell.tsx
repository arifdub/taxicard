'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial)

  useEffect(() => {
    const supabase = createClient()

    async function refresh() {
      const { data } = await supabase.rpc('unread_notification_count')
      if (typeof data === 'number') setCount(data)
    }

    // Cheap poll; the push notification is what actually wakes a driver.
    const id = setInterval(refresh, 30000)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return (
    <Link
      href="/dashboard/notifications"
      aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl text-white"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.6a5.9 5.9 0 0 0-5.9 5.9v3.1L4.4 15a1 1 0 0 0 .9 1.5h13.4a1 1 0 0 0 .9-1.5l-1.7-3.4V8.5A5.9 5.9 0 0 0 12 2.6zM9.7 18a2.4 2.4 0 0 0 4.6 0z" />
      </svg>
      {count > 0 ? (
        <span className="absolute right-1 top-1 min-w-[18px] rounded-full bg-yellow px-1 text-center text-[11px] font-bold leading-[18px] text-navy">
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  )
}
