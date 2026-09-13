'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3.5 10.6 12 3.8l8.5 6.8V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1z" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.2" y="5" width="17.6" height="16" rx="2.4" />
      <path d="M3.2 9.6h17.6M8 3.2v3.4M16 3.2v3.4" strokeLinecap="round" />
    </svg>
  )
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3.2" y="4.6" width="17.6" height="14.8" rx="2.4" />
      <path d="M7.4 9.4h9.2M7.4 13h6.4" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Sticky bottom bar for the three places a driver goes constantly.
 * Everything else stays in the menu.
 */
export default function TabBar({
  showJobs,
  jobCount = 0,
}: {
  showJobs: boolean
  jobCount?: number
}) {
  const pathname = usePathname()

  const tabs = [
    { href: '/dashboard', label: 'Dashboard', Icon: HomeIcon, exact: true, badge: 0 },
    { href: '/dashboard/bookings', label: 'Bookings', Icon: CalendarIcon, exact: false, badge: 0 },
    ...(showJobs
      ? [
          {
            href: '/dashboard/jobs',
            label: 'Jobs',
            Icon: ListIcon,
            exact: false,
            badge: jobCount,
          },
        ]
      : []),
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0B1425]/95 backdrop-blur">
      <div
        className="mx-auto flex max-w-md items-stretch"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {tabs.map(({ href, label, Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 text-[12px] font-semibold ${
                active ? 'text-yellow' : 'text-slate-400'
              }`}
            >
              <span className="relative">
                <Icon active={active} />
                {badge > 0 ? (
                  <span className="absolute -right-2.5 -top-1.5 min-w-[19px] rounded-full bg-red-500 px-1 text-center text-[11px] font-bold leading-[19px] text-white">
                    {badge > 9 ? '9+' : badge}
                  </span>
                ) : null}
              </span>
              {label}
              <span
                className={`absolute bottom-0 h-[3px] w-10 rounded-full transition-colors ${
                  active ? 'bg-yellow' : 'bg-transparent'
                }`}
              />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
