'use client'

import { useEffect, useState, useTransition } from 'react'
import { setAvailability } from './card/actions'

/* ---------- shared shell ---------- */

function Card({
  icon,
  iconClass,
  title,
  subtitle,
  control,
}: {
  icon: React.ReactNode
  iconClass: string
  title: string
  subtitle: string
  control: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 light:border-slate-200 bg-navy-soft light:bg-white px-4 py-3.5">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-semibold text-white light:text-navy">
          {title}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-slate-400 light:text-slate-500">
          {subtitle}
        </span>
      </span>
      {control}
    </div>
  )
}

function Switch({
  on,
  disabled,
  onChange,
  label,
}: {
  on: boolean
  disabled?: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-9 w-16 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
        on ? 'bg-emerald-500' : 'bg-white/25 light:bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${
          on ? 'left-8' : 'left-1'
        }`}
      />
    </button>
  )
}

/* ---------- online ---------- */

export function OnlineCard({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial)
  const [pending, start] = useTransition()

  return (
    <Card
      iconClass={on ? 'bg-emerald-500/15' : 'bg-white/10 light:bg-navy/5'}
      icon={
        <span
          className={`h-3.5 w-3.5 rounded-full ${
            on ? 'bg-emerald-400' : 'bg-slate-500'
          }`}
        />
      }
      title={on ? 'You are online' : 'You are offline'}
      subtitle={
        on ? 'You will receive job requests' : 'Your card shows as unavailable'
      }
      control={
        <Switch
          on={on}
          disabled={pending}
          label="Online and available"
          onChange={() => {
            const next = !on
            setOn(next)
            start(async () => {
              const res = await setAvailability(next)
              if (res?.error) setOn(!next)
            })
          }}
        />
      }
    />
  )
}

/* ---------- notifications ---------- */

type PushState = 'checking' | 'unsupported' | 'needs-install' | 'off' | 'on' | 'blocked'

function toUint8Array(base64: string) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const raw = atob(padded)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as unknown as { standalone?: boolean }).standalone === true

export function NotificationsCard() {
  const [state, setState] = useState<PushState>('checking')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    async function check() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setState(isIos() && !isStandalone() ? 'needs-install' : 'unsupported')
        return
      }
      if (isIos() && !isStandalone()) return setState('needs-install')
      if (Notification.permission === 'denied') return setState('blocked')

      const reg = await navigator.serviceWorker.register('/sw.js')
      const existing = await reg.pushManager.getSubscription()
      setState(existing && Notification.permission === 'granted' ? 'on' : 'off')
    }
    check().catch(() => setState('unsupported'))
  }, [])

  async function enable() {
    setBusy(true)
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
      setState('off')
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
      // leave as is
    }
    setBusy(false)
  }

  if (state === 'checking') return null

  const bell = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.6a5.9 5.9 0 0 0-5.9 5.9v3.1L4.4 15a1 1 0 0 0 .9 1.5h13.4a1 1 0 0 0 .9-1.5l-1.7-3.4V8.5A5.9 5.9 0 0 0 12 2.6zM9.7 18a2.4 2.4 0 0 0 4.6 0z" />
    </svg>
  )

  if (state === 'needs-install' || state === 'unsupported') {
    return (
      <Card
        iconClass="bg-white/10 light:bg-navy/5 text-slate-300 light:text-slate-600"
        icon={bell}
        title="Booking notifications"
        subtitle={
          state === 'needs-install'
            ? 'Add TaxiCard to your home screen first, then open it from the icon.'
            : 'This browser cannot show alerts.'
        }
        control={
          state === 'needs-install' ? (
            <a
              href="/install"
              className="shrink-0 rounded-xl bg-yellow px-3 py-2 text-sm font-bold text-navy"
            >
              How
            </a>
          ) : (
            <span />
          )
        }
      />
    )
  }

  if (state === 'blocked') {
    return (
      <Card
        iconClass="bg-red-500/15 text-red-300"
        icon={bell}
        title="Notifications blocked"
        subtitle="Allow them for taxicard.ie in your phone settings."
        control={<span />}
      />
    )
  }

  const on = state === 'on'

  return (
    <Card
      iconClass={on ? 'bg-yellow/15 text-yellow' : 'bg-white/10 light:bg-navy/5 text-slate-300 light:text-slate-600'}
      icon={bell}
      title="Booking notifications"
      subtitle={
        on
          ? 'You will be alerted when a new booking arrives'
          : 'Turn on to be alerted when a booking arrives'
      }
      control={
        <Switch
          on={on}
          disabled={busy}
          label="Booking notifications"
          onChange={() => (on ? disable() : enable())}
        />
      }
    />
  )
}
