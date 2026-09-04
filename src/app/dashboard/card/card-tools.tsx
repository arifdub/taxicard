'use client'

import { useRef, useState, useTransition, type ChangeEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { setAvailability, savePhotoUrl } from './actions'

const MAX_BYTES = 5 * 1024 * 1024

export function AvailabilitySwitch({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial)
  const [pending, start] = useTransition()

  function toggle() {
    const next = !on
    setOn(next)
    start(async () => {
      const res = await setAvailability(next)
      if (res?.error) setOn(!next)
    })
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
      <span className="text-sm font-medium">
        {on ? 'Online, available' : 'Offline, not taking bookings'}
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        role="switch"
        aria-checked={on}
        aria-label="Availability"
        className={`relative h-7 w-12 rounded-full transition-colors ${
          on ? 'bg-emerald-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
            on ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

export function PhotoUpload({ userId }: { userId: string }) {
  const input = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setStatus('Pick an image file.')
      return
    }
    if (file.size > MAX_BYTES) {
      setStatus('That image is over 5 MB. Try a smaller one.')
      return
    }

    setBusy(true)
    setStatus(null)

    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${userId}/photo-${Date.now()}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('driver-media')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (upErr) {
      setBusy(false)
      setStatus('Upload failed. Check the driver-media bucket exists.')
      return
    }

    const { data } = supabase.storage.from('driver-media').getPublicUrl(path)
    const res = await savePhotoUrl(data.publicUrl)

    setBusy(false)
    setStatus(res?.error ? res.error : 'Photo updated.')
    if (input.current) input.current.value = ''
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        onChange={onPick}
        disabled={busy}
        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white"
      />
      {status ? <p className="mt-2 text-sm text-slate-600">{status}</p> : null}
    </div>
  )
}

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        } catch {
          setCopied(false)
        }
      }}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium"
    >
      {copied ? 'Link copied' : 'Copy my booking link'}
    </button>
  )
}
