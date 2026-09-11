'use client'

import { useEffect, useState } from 'react'

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

/**
 * One line under the card telling a passenger they can keep it. Hidden
 * once the card is already installed, so it never nags.
 */
export default function SaveHint({ name }: { name: string }) {
  const [mode, setMode] = useState<'hidden' | 'ios' | 'other'>('hidden')

  useEffect(() => {
    if (isStandalone()) return
    setMode(isIos() ? 'ios' : 'other')
  }, [])

  if (mode === 'hidden') return null

  return (
    <div className="tc-in tc-d6 mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
      <p className="text-center text-[13px] font-semibold text-white">
        Keep {name} on your home screen
      </p>

      {mode === 'ios' ? (
        <p className="mt-1.5 text-center text-[12px] leading-relaxed text-white/65">
          Tap the <span className="font-semibold text-white">share</span>{' '}
          button, then{' '}
          <span className="font-semibold text-white">Add to Home Screen</span>.{' '}
          <a href="/install" className="underline">
            Show me
          </a>
        </p>
      ) : (
        <p className="mt-1.5 text-center text-[12px] leading-relaxed text-white/65">
          Tap the{' '}
          <span className="font-semibold text-white">three dots</span> at the
          top right, then{' '}
          <span className="font-semibold text-white">Install</span> or{' '}
          <span className="font-semibold text-white">Add to Home screen</span>.{' '}
          <a href="/install" className="underline">
            Show me
          </a>
        </p>
      )}
    </div>
  )
}
