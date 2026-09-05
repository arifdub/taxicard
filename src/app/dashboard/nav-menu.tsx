'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { logOut } from '@/app/auth/actions'

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/bookings', label: 'Bookings' },
  { href: '/dashboard/customers', label: 'Customers' },
  { href: '/dashboard/card', label: 'My card' },
  { href: '/dashboard/settings', label: 'Profile' },
]

export default function NavMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on Escape, and stop the page behind from scrolling while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg"
      >
        <span className="space-y-1.5" aria-hidden="true">
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/60"
          />

          <nav className="absolute inset-y-0 right-0 flex w-72 max-w-[85%] flex-col bg-navy-soft shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="text-base font-semibold text-white">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="-mr-2 flex h-9 w-9 items-center justify-center text-2xl leading-none text-slate-400"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 px-3 py-3">
              {LINKS.map((l) => {
                const active =
                  l.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(l.href)
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3.5 text-base ${
                      active
                        ? 'bg-white/10 font-semibold text-yellow'
                        : 'font-medium text-slate-300'
                    }`}
                  >
                    {l.label}
                  </Link>
                )
              })}
            </div>

                        <div className="border-t border-white/10 p-3">
              <form action={logOut}>
                <button className="w-full rounded-xl px-4 py-3.5 text-left text-base font-medium text-red-300">
                  Log out
                </button>
              </form>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  )
}
