'use client'

import { useEffect, useState } from 'react'

type State =
  | 'checking'
  | 'unsupported'
  | 'needs-install'
  | 'off'
  | 'on'
  | 'blocked'

function toUint8Array(base64: string) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const raw = atob(padded)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS reports it here instead
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export default function PushSetup({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<State>('checking')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function check() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        // On iPhone the Push API only exists once the app is on the Home
        // Screen, so distinguish "can't" from "not yet installed".
        setState(isIos() && !isStandalone() ? 'needs-install' : 'unsupported')
        return
      }
      if (isIos() && !isStandalone()) {
        setState('needs-install')
        return
      }
      if (Notification.permission === 'denied') {
        setState('blocked')
        return
      }

      const reg = await navigator.serviceWorker.register('/sw.js')
      const existing = await reg.pushManager.getSubscription()
      setState(existing && Notification.permission === 'granted' ? 'on' : 'off')
    }
    check().catch(() => setState('unsupported'))
  }, [])

  async function enable() {
    setBusy(true)
    setError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'blocked' : 'off')
        setBusy(false)
        return
      }

      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      if (!res.ok) throw new Error('save failed')
      setState('on')
    } catch {
      setError('Could not turn on notifications. Try again.')
    }
    setBusy(false)
  }

  async function disable() {
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setState('off')
    } catch {
      setError('Could not turn them off.')
    }
    setBusy(false)
  }

  if (state === 'checking') return null

  // Nothing actionable here yet, so keep the dashboard clear.
  if (compact && (state === 'needs-install' || state === 'unsupported')) {
    return null
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-navy-soft p-4">
      <h2 className="text-sm font-semibold text-slate-400">
        Booking notifications
      </h2>

      {state === 'needs-install' ? (
        <div className="mt-2 text-sm text-slate-300">
          <p>
            To get an alert on your phone, add TaxiCard to your Home Screen
            first. Apple only allows notifications for installed web apps.
          </p>
          <p className="mt-2">
            In Safari, tap the share button at the bottom, then{' '}
            <span className="font-medium">Add to Home Screen</span>. Open
            TaxiCard from that icon and come back here.
          </p>
        </div>
      ) : null}

      {state === 'unsupported' ? (
        <p className="mt-2 text-sm text-slate-300">
          This browser cannot do notifications. Try Chrome on Android, or add
          TaxiCard to your Home Screen on iPhone.
        </p>
      ) : null}

      {state === 'blocked' ? (
        <p className="mt-2 text-sm text-slate-300">
          Notifications are blocked for this site. Turn them back on in your
          phone settings, then reload this page.
        </p>
      ) : null}

      {state === 'off' ? (
        <>
          <p className="mt-2 text-sm text-slate-300">
            Get an alert the moment a customer books, without watching the
            dashboard.
          </p>
          <button
            onClick={enable}
            disabled={busy}
            className="mt-3 w-full rounded-xl bg-yellow px-4 py-3.5 font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Turning on…' : 'Turn on notifications'}
          </button>
        </>
      ) : null}

      {state === 'on' ? (
        <>
          <p className="mt-2 text-sm text-emerald-300">
            On for this device. You will be alerted when a booking arrives.
          </p>
          <button
            onClick={disable}
            disabled={busy}
            className="mt-3 w-full rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-slate-200 disabled:opacity-60"
          >
            Turn off on this device
          </button>
        </>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </div>
  )
}
