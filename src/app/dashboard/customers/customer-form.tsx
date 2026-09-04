'use client'

import { useActionState, useState, useTransition } from 'react'
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  type CustomerState,
} from './actions'

const initial: CustomerState = {}

export type CustomerValues = {
  name: string
  phone: string
  email: string | null
  favourite_pickup: string | null
  notes: string | null
}

function Fields({ v }: { v?: CustomerValues }) {
  return (
    <>
      <Input label="Name" name="name" defaultValue={v?.name} required />
      <Input
        label="Phone"
        name="phone"
        type="tel"
        inputMode="tel"
        defaultValue={v?.phone}
        required
        placeholder="087 123 4567"
      />
      <Input label="Email (optional)" name="email" type="email" defaultValue={v?.email ?? ''} />
      <Input
        label="Usual pickup (optional)"
        name="favourite_pickup"
        defaultValue={v?.favourite_pickup ?? ''}
        placeholder="12 Main Street"
      />
      <Input
        label="Private notes (optional)"
        name="notes"
        defaultValue={v?.notes ?? ''}
        placeholder="Early airport runs, always two bags"
      />
    </>
  )
}

function Input({
  label,
  name,
  ...rest
}: { label: string; name: string } & React.ComponentProps<'input'>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">
        {label}
      </span>
      <input
        name={name}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
        {...rest}
      />
    </label>
  )
}

export function AddCustomer() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(addCustomer, initial)

  if (state.message && open) {
    // Close once it saved, so the new row shows in the list behind.
    setTimeout(() => setOpen(false), 400)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium"
      >
        Add a customer
      </button>
    )
  }

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-navy">New customer</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500">
          Cancel
        </button>
      </div>

      {state.error ? <Alert kind="error">{state.error}</Alert> : null}
      {state.message ? <Alert kind="ok">{state.message}</Alert> : null}

      <Fields />

      <button
        disabled={pending}
        className="w-full rounded-xl bg-yellow px-4 py-3.5 font-semibold text-navy disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save customer'}
      </button>
    </form>
  )
}

export function EditCustomer({ id, values }: { id: string; values: CustomerValues }) {
  const [open, setOpen] = useState(false)
  const bound = updateCustomer.bind(null, id)
  const [state, action, pending] = useActionState(bound, initial)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium"
      >
        Edit details
      </button>
    )
  }

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-navy">Edit customer</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500">
          Close
        </button>
      </div>

      {state.error ? <Alert kind="error">{state.error}</Alert> : null}
      {state.message ? <Alert kind="ok">{state.message}</Alert> : null}

      <Fields v={values} />

      <button
        disabled={pending}
        className="w-full rounded-xl bg-yellow px-4 py-3.5 font-semibold text-navy disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}

export function DeleteCustomer({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, start] = useTransition()

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="w-full px-4 py-3 text-sm text-red-700"
      >
        Delete customer
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-900">
        Delete {name}? This removes their booking history too, and cannot be
        undone.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          disabled={pending}
          onClick={() => start(() => void deleteCustomer(id))}
          className="rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium"
        >
          Keep
        </button>
      </div>
    </div>
  )
}

function Alert({ kind, children }: { kind: 'error' | 'ok'; children: React.ReactNode }) {
  const tone =
    kind === 'error'
      ? 'bg-red-50 text-red-800 border-red-100'
      : 'bg-emerald-50 text-emerald-800 border-emerald-100'
  return (
    <p role="status" className={`rounded-xl border px-3 py-2.5 text-sm ${tone}`}>
      {children}
    </p>
  )
}
