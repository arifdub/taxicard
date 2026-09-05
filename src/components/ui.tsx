import { type InputHTMLAttributes, type ReactNode } from 'react'

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
