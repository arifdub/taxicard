'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Browser = 'ios-safari' | 'ios-chrome' | 'android'

const DISMISSED_KEY = 'tc-install-modal-dismissed'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function detectBrowser(): Browser | null {
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua)) return /crios/i.test(ua) ? 'ios-chrome' : 'ios-safari'
  return null
}

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M12 3v12" strokeLinecap="round" />
    <path d="M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5.5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="18.5" r="2" />
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <path d="M12 8v8M8 12h8" strokeLinecap="round" />
  </svg>
)

type Step = { icon: React.ReactNode; text: React.ReactNode }

const STEPS: Record<Browser, Step[]> = {
  'ios-safari': [
    {
      icon: <ShareIcon />,
      text: (
        <>
          Tap <span className="font-semibold text-white light:text-navy">Share</span> in the bar at the bottom of the screen.
        </>
      ),
    },
    {
      icon: <PlusIcon />,
      text: (
        <>
          Scroll down and choose{' '}
          <span className="font-semibold text-white light:text-navy">Add to Home Screen</span>.
        </>
      ),
    },
    { icon: null, text: <>Tap <span className="font-semibold text-white light:text-navy">Add</span>.</> },
  ],
  'ios-chrome': [
    {
      icon: <ShareIcon />,
      text: (
        <>
          Tap <span className="font-semibold text-white light:text-navy">Share</span> beside the address bar at the top.
        </>
      ),
    },
    {
      icon: <PlusIcon />,
      text: (
        <>
          Scroll down and choose{' '}
          <span className="font-semibold text-white light:text-navy">Add to Home Screen</span>.
        </>
      ),
    },
    { icon: null, text: <>Tap <span className="font-semibold text-white light:text-navy">Add</span>.</> },
  ],
  android: [
    { icon: <DotsIcon />, text: <>Tap the three dots at the top right.</> },
    {
      icon: <PlusIcon />,
      text: (
        <>
          Tap <span className="font-semibold text-white light:text-navy">Add to Home screen</span>, or{' '}
          <span className="font-semibold text-white light:text-navy">Install app</span>.
        </>
      ),
    },
    { icon: null, text: <>Tap <span className="font-semibold text-white light:text-navy">Install</span>.</> },
  ],
}

/**
 * A one-time popup, shown the first time a driver lands on the dashboard,
 * pointing at wherever the "add to home screen" control actually sits for
 * their browser — bottom toolbar for Safari, top address bar for Chrome —
 * since Apple only allows push notifications for an installed web app.
 */
export default function InstallModal() {
  const [browser, setBrowser] = useState<Browser | null>(null)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(DISMISSED_KEY)) return

    const b = detectBrowser()
    if (!b) return
    setBrowser(b)

    if (b === 'android') {
      const onPrompt = (e: Event) => {
        e.preventDefault()
        setDeferred(e as BeforeInstallPromptEvent)
      }
      window.addEventListener('beforeinstallprompt', onPrompt)
      return () => window.removeEventListener('beforeinstallprompt', onPrompt)
    }
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // private browsing — fine, it'll just ask again next visit
    }
    setBrowser(null)
  }

  if (!browser) return null

  const pointsToBottom = browser === 'ios-safari'

  return (
    <div className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-[1px]">
      {pointsToBottom ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[91] flex flex-col items-center gap-1.5">
          <span className="rounded-full bg-yellow px-3 py-1.5 text-xs font-bold text-navy shadow-lg">
            Share is down here
          </span>
          <svg className="animate-bounce" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFC72C" strokeWidth="2.6" aria-hidden="true">
            <path d="M12 4v15M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <div
          className="pointer-events-none fixed right-4 z-[91] flex flex-col items-end gap-1.5"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 10px)' }}
        >
          <svg className="animate-bounce" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFC72C" strokeWidth="2.6" aria-hidden="true">
            <path d="M12 20V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="rounded-full bg-yellow px-3 py-1.5 text-xs font-bold text-navy shadow-lg">
            {browser === 'android' ? 'Menu is up here' : 'Share is up here'}
          </span>
        </div>
      )}

      <div className="fixed inset-x-4 top-1/2 z-[92] mx-auto max-w-sm -translate-y-1/2 rounded-3xl border border-white/10 light:border-slate-200 bg-[#0B1425] light:bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/icon-192.png" alt="" className="h-11 w-11 rounded-xl" />
            <div>
              <p className="text-base font-bold text-white light:text-navy">
                Add to your Home Screen
              </p>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Free &middot; booking alerts need it installed
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Close"
            className="shrink-0 rounded-full bg-white/10 light:bg-navy/10 p-1.5 text-slate-300 light:text-slate-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ol className="mt-4 space-y-3.5">
          {STEPS[browser].map((s, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow text-xs font-bold text-navy">
                {i + 1}
              </span>
              <span className="flex flex-1 items-center gap-2 text-sm text-slate-300 light:text-slate-600">
                {s.icon ? <span className="shrink-0 text-yellow">{s.icon}</span> : null}
                <span>{s.text}</span>
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-4 rounded-xl bg-white/5 light:bg-navy/5 px-3 py-2.5 text-xs text-slate-400 light:text-slate-500">
          Then open TaxiCard from that new icon and turn on booking alerts in
          Profile — that&apos;s what makes a job ring your phone.
        </p>

        {deferred ? (
          <button
            onClick={async () => {
              await deferred.prompt()
              const { outcome } = await deferred.userChoice
              if (outcome === 'accepted') dismiss()
            }}
            className="mt-4 w-full rounded-xl bg-yellow px-4 py-3 text-sm font-semibold text-navy"
          >
            Install now
          </button>
        ) : null}

        <button
          onClick={dismiss}
          className="mt-3 w-full py-1 text-center text-xs text-slate-500 light:text-slate-400"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
