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
    <p className="tc-in tc-d6 mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-[13px] leading-relaxed text-white/70">
      <span className="font-semibold text-white">Keep {name} handy.</span>{' '}
      {mode === 'ios'
        ? 'Tap the share button, then Add to Home Screen, and this card becomes an icon on your phone.'
        : 'Tap the menu button, then Add to Home screen, and this card becomes an icon on your phone.'}
    </p>
  )
}
