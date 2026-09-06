'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Supabase's default email template sends the session back in the URL
 * fragment (#access_token=...). A server never sees a fragment, so this
 * has to be read in the browser.
 */
export default function HashHandler() {
  const router = useRouter()
  const [state, setState] = useState<'working' | 'failed'>('working')

  useEffect(() => {
    async function run() {
      const hash = window.location.hash.replace(/^#/, '')
      const params = new URLSearchParams(hash)
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')

      if (!access_token || !refresh_token) {
        setState('failed')
        return
      }

      const supabase = createClient()
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (error) {
        setState('failed')
        return
      }

      // Clear the tokens out of the address bar before moving on.
      window.history.replaceState(null, '', window.location.pathname)
      router.replace('/auth/update-password')
    }

    run().catch(() => setState('failed'))
  }, [router])

  if (state === 'working') {
    return <p className="mt-6 text-sm text-slate-400">Checking your link…</p>
  }

  return (
    <div className="mt-6 space-y-4">
      <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
        That link has expired or was already used. Reset links work once,
        and only in the browser you open them in.
      </p>
      <Link
        href="/reset-password"
        className="block rounded-xl bg-yellow px-4 py-3.5 text-center font-semibold text-navy"
      >
        Send me a new link
      </Link>
      <Link href="/login" className="block text-center text-sm text-brandblue">
        Back to log in
      </Link>
    </div>
  )
}
