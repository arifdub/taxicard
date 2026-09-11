'use client'

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react'

type Guide = 'ios-safari' | 'ios-chrome' | 'android'

const GUIDES: { id: Guide; label: string; src: string; alt: string }[] = [
  {
    id: 'ios-safari',
    label: 'iPhone · Safari',
    src: '/guides/ios-safari.jpg',
    alt: 'Six steps to add TaxiCard to an iPhone home screen using Safari',
  },
  {
    id: 'ios-chrome',
    label: 'iPhone · Chrome',
    src: '/guides/ios-chrome.jpg',
    alt: 'Five steps to add TaxiCard to an iPhone home screen using Chrome',
  },
  {
    id: 'android',
    label: 'Android · Chrome',
    src: '/guides/android.jpg',
    alt: 'Four steps to install TaxiCard on an Android phone using Chrome',
  },
]

export default function GuidePicker() {
  const [active, setActive] = useState<Guide>('ios-safari')

  // Start on whichever guide matches the phone they are holding.
  useEffect(() => {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) {
      setActive('android')
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      setActive(/crios/i.test(ua) ? 'ios-chrome' : 'ios-safari')
    }
  }, [])

  const current = GUIDES.find((g) => g.id === active) ?? GUIDES[0]

  return (
    <div className="mt-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {GUIDES.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              active === g.id
                ? 'bg-yellow text-navy'
                : 'border border-white/15 bg-white/5 text-slate-300'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-white">
        <img
          key={current.id}
          src={current.src}
          alt={current.alt}
          className="block w-full"
        />
      </div>

      <p className="mt-3 text-center text-xs text-slate-500">
        Pinch to zoom if the steps are small.
      </p>
    </div>
  )
}
