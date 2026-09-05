'use client'

import { useEffect, useState } from 'react'

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export default function PrintButton() {
  const [installed, setInstalled] = useState(false)
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    setInstalled(isStandalone())
    setUrl(window.location.href)
  }, [])

  // iOS gives an installed web app no print dialog, so send them to the
  // browser rather than leaving a button that does nothing.
  if (installed) {
    return (
      <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
        <p className="text-sm font-semibold text-amber-100">
          Printing does not work inside the installed app
        </p>
        <p className="mt-2 text-sm text-amber-100/80">
          Apple does not give home-screen apps a print dialog. Open this
          page in Safari or Chrome instead and the button will appear.
        </p>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            } catch {
              setCopied(false)
            }
          }}
          className="mt-3 w-full rounded-xl bg-yellow px-4 py-3 text-sm font-semibold text-navy"
        >
          {copied ? 'Link copied — paste it into Safari' : 'Copy this page link'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => window.print()}
      className="w-full rounded-2xl bg-yellow px-4 py-4 text-base font-semibold text-navy"
    >
      Print or save as PDF
    </button>
  )
}
