'use client'

import { useState, type InputHTMLAttributes, type ReactNode } from 'react'

export function Field({
  label,
  name,
  hint,
  ...props
}: { label: string; name: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-400">
        {label}
      </span>
      <input
        name={name}
        id={name}
        className="w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3 text-base text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15"
        {...props}
      />
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  )
}

export function TextArea({
  label,
  name,
  ...props
}: { label: string; name: string } & InputHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-400">
        {label}
      </span>
      <textarea
        name={name}
        id={name}
        rows={3}
        className="w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3 text-base text-white outline-none focus:border-yellow focus:ring-4 focus:ring-yellow/15"
        {...(props as object)}
      />
    </label>
  )
}

export function Alert({ kind, children }: { kind: 'error' | 'ok'; children: ReactNode }) {
  const tone =
    kind === 'error'
      ? 'bg-red-500/10 text-red-200 border-red-400/30'
      : 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30'
  return (
    <p role="status" className={`rounded-xl border px-3 py-2.5 text-sm ${tone}`}>
      {children}
    </p>
  )
}

export function Submit({ children, pending }: { children: ReactNode; pending?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-yellow px-4 py-3.5 text-base font-semibold text-white disabled:opacity-60"
    >
      {pending ? 'Working…' : children}
    </button>
  )
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3.2" />
      {off ? <path d="M4 20 20 4" /> : null}
    </svg>
  )
}

/**
 * A password box with a reveal button. Typing a password you cannot see,
 * twice, on a phone keyboard, is how people end up locked out.
 */
export function PasswordField({
  label,
  name,
  hint,
  ...props
}: { label: string; name: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false)

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">
        {label}
      </span>
      <span className="relative block">
        <input
          name={name}
          id={name}
          type={shown ? 'text' : 'password'}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 pr-12 text-base outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? 'Hide password' : 'Show password'}
          aria-pressed={shown}
          className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400"
        >
          <EyeIcon off={shown} />
        </button>
      </span>
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  )
}
