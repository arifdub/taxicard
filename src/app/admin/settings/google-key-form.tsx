'use client'

import { useActionState } from 'react'
import { updateGoogleApiKey, type SettingsState } from './actions'

const initial: SettingsState = {}
const field =
  'w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3 text-base text-white outline-none focus:border-yellow'

export default function GoogleKeyForm({ masked }: { masked: string | null }) {
  const [state, action, pending] = useActionState(updateGoogleApiKey, initial)

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-white/10 bg-navy-soft p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Google Maps / Places API key
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Used for address autocomplete as a pickup or destination is typed,
          and for turning an address into a map location. Get a key from the{' '}
          <a
            href="https://console.cloud.google.com/google/maps-apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brandblue underline"
          >
            Google Cloud Console
          </a>
          , with the Geocoding API and Places API enabled.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
          {state.message}
        </p>
      ) : null}

      <p className="text-xs text-slate-500">
        {masked ? (
          <>
            Currently set: <span className="font-mono text-slate-300">{masked}</span>
          </>
        ) : (
          'No key saved here yet — using the environment variable, if one is set.'
        )}
      </p>

      <input
        name="google_places_api_key"
        placeholder="AIza…"
        autoComplete="off"
        spellCheck={false}
        className={field}
      />
      <p className="text-xs text-slate-500">
        Leave blank and save to clear it and fall back to the environment
        variable.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-yellow px-4 py-3 text-sm font-semibold text-navy disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save key'}
      </button>
    </form>
  )
}
