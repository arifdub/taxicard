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
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-navy-soft px-4 py-3.5">
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
          on ? 'bg-emerald-600' : 'bg-white/25'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-navy-soft transition-all ${
            on ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

export function EditablePhoto({
  userId,
  photoUrl,
  name,
  tone = 'dark',
}: {
  userId: string
  photoUrl: string | null
  name: string
  // 'dark' sits on the navy card header, 'light' on a white page.
  tone?: 'dark' | 'light'
}) {
  const input = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(photoUrl)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const letters = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

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
      setStatus('Upload failed. Check the driver-media bucket exists and is public.')
      return
    }

    const { data } = supabase.storage.from('driver-media').getPublicUrl(path)
    const res = await savePhotoUrl(data.publicUrl)

    setBusy(false)
    if (res?.error) {
      setStatus(res.error)
    } else {
      setPreview(data.publicUrl)
      setStatus(null)
    }
    if (input.current) input.current.value = ''
  }

  return (
    <div>
      <input
        ref={input}
        id="photo-input"
        type="file"
        accept="image/*"
        onChange={onPick}
        disabled={busy}
        className="sr-only"
      />

      <label htmlFor="photo-input" className="block cursor-pointer">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={name}
            className="mx-auto h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-yellow text-2xl font-semibold text-white">
            {letters}
          </span>
        )}
      </label>

      <label
        htmlFor="photo-input"
        className={`mt-2 block cursor-pointer text-xs font-medium underline ${
          tone === 'dark' ? 'text-slate-300' : 'text-brandblue'
        }`}
      >
        {busy ? 'Uploading…' : preview ? 'Change photo' : 'Add a photo'}
      </label>

      {status ? (
        <p
          className={`mt-1 text-xs ${
            tone === 'dark' ? 'text-amber-300' : 'text-red-300'
          }`}
        >
          {status}
        </p>
      ) : null}
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
      className="w-full rounded-xl border border-white/10 bg-navy-soft px-4 py-3 text-sm font-medium"
    >
      {copied ? 'Link copied' : 'Copy my booking link'}
    </button>
  )
}
