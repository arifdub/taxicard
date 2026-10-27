'use client'

import { useActionState, useState, useTransition } from 'react'
import { updateGoogleApiKey, testGoogleApiKey, type SettingsState, type TestState } from './actions'

const initial: SettingsState = {}
const field =
  'w-full rounded-xl border border-white/10 bg-navy-soft px-3 py-3 text-base text-white outline-none focus:border-yellow'

export default function GoogleKeyForm({
  masked,
  source,
}: {
  masked: string | null
  source: 'database' | 'env' | 'none'
}) {
  const [state, action, pending] = useActionState(updateGoogleApiKey, initial)
  const [test, setTest] = useState<TestState>({})
  const [testing, startTest] = useTransition()

  const sourceLabel =
    source === 'database'
      ? 'the key saved here'
      : source === 'env'
        ? 'the GOOGLE_MAPS_SERVER_KEY environment variable'
        : 'no key — autocomplete is off'

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
      <p className="text-xs text-slate-500">
        Active right now: <span className="text-slate-300">{sourceLabel}</span>.
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

      <div className="border-t border-white/10 pt-3">
        <button
          type="button"
          disabled={testing}
          onClick={() =>
            startTest(async () => {
              setTest(await testGoogleApiKey())
            })
          }
          className="w-full rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200 disabled:opacity-60"
        >
          {testing ? 'Testing…' : 'Test this key'}
        </button>
        <p className="mt-1.5 text-xs text-slate-500">
          Sends a real autocomplete request for &quot;Dublin Airport&quot; and
          shows exactly what Google says back.
        </p>

        {test.error ? (
          <p className="mt-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
            {test.error}
          </p>
        ) : null}
        {test.message ? (
          <p className="mt-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
            {test.message}
          </p>
        ) : null}
      </div>
    </form>
  )
}
