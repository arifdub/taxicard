'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export default function InstallPrompt() {
  const [mode, setMode] = useState<'hidden' | 'ios' | 'android'>('hidden')
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone()) return

    if (isIos()) {
      setMode('ios')
      return
    }

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setMode('android')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (mode === 'hidden') return null

  return (
    <div className="rounded-2xl border border-yellow/25 bg-yellow/10 p-4 text-white">
      <p className="font-semibold">Put TaxiCard on your home screen</p>

      {mode === 'ios' ? (
        <p className="mt-2 text-sm text-slate-300">
          Tap the share button at the bottom of Safari, then{' '}
          <span className="font-medium text-white">Add to Home Screen</span>.
          Open it from that icon and you can turn on booking alerts.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-300">
            One tap, and it opens like an app. No download, no App Store.
          </p>
          <button
            onClick={async () => {
              if (!deferred) return
              await deferred.prompt()
              const { outcome } = await deferred.userChoice
              if (outcome === 'accepted') setMode('hidden')
            }}
            className="mt-3 w-full rounded-xl bg-yellow px-4 py-3 font-semibold text-navy"
          >
            Add to home screen
          </button>
        </>
      )}
    </div>
  )
}
