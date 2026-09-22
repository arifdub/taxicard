'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'tc-theme'
const SHELL_ID = 'tc-app-shell'

function isLight() {
  return document.getElementById(SHELL_ID)?.getAttribute('data-theme') === 'light'
}

function SunIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.6" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.7 14.8A8.6 8.6 0 0 1 9.2 3.3a.7.7 0 0 0-.9-.9 10 10 0 1 0 13.3 13.3.7.7 0 0 0-.9-.9z" />
    </svg>
  )
}

/**
 * Scoped to the dashboard shell (#tc-app-shell), not the whole document, so
 * the toggle never bleeds into the public marketing pages.
 */
export default function ThemeToggle() {
  const [light, setLight] = useState(false)

  useEffect(() => {
    setLight(isLight())
  }, [])

  function toggle() {
    const next = !light
    setLight(next)
    const shell = document.getElementById(SHELL_ID)
    if (shell) {
      if (next) shell.setAttribute('data-theme', 'light')
      else shell.removeAttribute('data-theme')
    }
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'light' : 'dark')
    } catch {
      // storage unavailable, theme just won't persist
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? 'Switch to night theme' : 'Switch to day theme'}
      aria-pressed={light}
      title={light ? 'Switch to night theme' : 'Switch to day theme'}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-white light:text-navy"
    >
      {light ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
