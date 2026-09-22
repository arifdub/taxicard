'use client'

import { useEffect, useState } from 'react'

const SHELL_KEY = 'tc-shell-version'
const DISMISS_KEY = 'tc-update-dismissed'

type VersionsFile = {
  latestShellVersion: number
  latest: string | null
}

function isAndroidStandalone() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  const android = /android/i.test(navigator.userAgent)
  return standalone && android
}

/**
 * Only means anything for the Android APK build: the manifest's start_url
 * carries ?shellv=N, set once at launch from the home-screen icon (client
 * navigation drops the query string, so it's saved to localStorage on
 * first sight). Compared against public/downloads/versions.json — bump
 * both together whenever a new shell is published.
 */
export default function UpdateBanner() {
  const [update, setUpdate] = useState<{ version: string; shell: number } | null>(
    null
  )

  useEffect(() => {
    if (!isAndroidStandalone()) return

    const fromUrl = new URLSearchParams(window.location.search).get('shellv')
    if (fromUrl) {
      try {
        localStorage.setItem(SHELL_KEY, fromUrl)
      } catch {
        // storage unavailable, nothing to persist
      }
    }

    let installed: number | null = null
    try {
      const stored = fromUrl ?? localStorage.getItem(SHELL_KEY)
      installed = stored ? Number(stored) : null
    } catch {
      installed = fromUrl ? Number(fromUrl) : null
    }
    if (installed == null || Number.isNaN(installed)) return

    fetch('/downloads/versions.json', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: VersionsFile) => {
        if (!data.latest || data.latestShellVersion <= installed!) return

        let dismissed: string | null = null
        try {
          dismissed = localStorage.getItem(DISMISS_KEY)
        } catch {
          dismissed = null
        }
        if (dismissed === String(data.latestShellVersion)) return

        setUpdate({ version: data.latest, shell: data.latestShellVersion })
      })
      .catch(() => {})
  }, [])

  if (!update) return null

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(update?.shell))
    } catch {
      // storage unavailable, banner just won't stay dismissed
    }
    setUpdate(null)
  }

  return (
    <div className="flex items-center gap-3 border-b border-yellow/25 bg-yellow/10 px-5 py-2.5 text-sm light:bg-yellow/20">
      <span className="flex-1 text-white light:text-navy">
        A new app version (v{update.version}) is available.
      </span>
      <a
        href="/downloads"
        className="shrink-0 font-semibold text-yellow underline"
      >
        Update
      </a>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-lg leading-none text-slate-400 light:text-slate-500"
      >
        &times;
      </button>
    </div>
  )
}
