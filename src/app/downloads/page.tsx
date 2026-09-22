import fs from 'node:fs/promises'
import path from 'node:path'
import Link from 'next/link'
import type { Metadata } from 'next'
import Wordmark from '@/components/wordmark'

export const metadata: Metadata = {
  title: 'Download the TaxiCard Android app',
  description:
    'Install TaxiCard directly on Android, no Google Play Store needed.',
}

type VersionEntry = {
  version: string
  file: string
  date: string
  notes?: string
}

type VersionsFile = {
  latestShellVersion: number
  latest: string | null
  versions: VersionEntry[]
}

/**
 * Reading the JSON file to publish a new APK:
 *   1. Drop the .apk in public/downloads/, e.g. taxicard-1.1.0.apk
 *   2. Add an entry to "versions" and point "latest" at its version string
 *   3. Bump "latestShellVersion" by 1 (this is what the in-app update
 *      banner compares against — see components/update-banner.tsx)
 *   4. Commit, push, redeploy
 */
async function getVersions(): Promise<VersionsFile> {
  const file = path.join(process.cwd(), 'public/downloads/versions.json')
  const raw = await fs.readFile(file, 'utf8')
  return JSON.parse(raw) as VersionsFile
}

export default async function DownloadsPage() {
  const data = await getVersions()
  const latest =
    data.versions.find((v) => v.version === data.latest) ?? data.versions[0]
  const older = data.versions.filter((v) => v !== latest)

  return (
    <main className="tc-dark-page w-full px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.5rem)] text-white">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark size="sm" />
        </Link>

        <h1 className="text-2xl font-semibold md:text-3xl">
          Download TaxiCard for Android
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Install it directly on your phone — no Google Play Store account
          needed. One tap, opens like any other app, with full booking
          alerts.
        </p>

        {latest ? (
          <>
            <a
              href={latest.file}
              download
              className="mt-6 block rounded-2xl bg-yellow px-5 py-4 text-center text-base font-bold text-navy"
            >
              Download TaxiCard v{latest.version}
            </a>
            <p className="mt-2 text-xs text-slate-400">
              {latest.date}
              {latest.notes ? ` — ${latest.notes}` : ''}
            </p>

            <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-navy-soft p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">How to install</p>
              <ol className="list-decimal space-y-1.5 pl-4">
                <li>Tap the download button above.</li>
                <li>
                  Open the downloaded file. Android will warn about
                  &quot;installing from unknown sources&quot; the first time
                  — tap Settings, then allow it for your browser.
                </li>
                <li>Tap Install, then Open.</li>
              </ol>
            </div>

            {older.length > 0 ? (
              <div className="mt-8">
                <p className="text-sm font-semibold text-white">
                  Older versions
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {older.map((v) => (
                    <li key={v.version}>
                      <a href={v.file} download className="text-brandblue">
                        v{v.version}
                      </a>
                      <span className="ml-2 text-xs text-slate-500">
                        {v.date}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-white/10 bg-navy-soft p-5 text-sm text-slate-300">
            <p className="font-semibold text-white">Coming soon</p>
            <p className="mt-1">
              The Android app isn&apos;t published here yet. In the
              meantime,{' '}
              <Link href="/install" className="text-brandblue">
                add TaxiCard to your home screen
              </Link>{' '}
              the same way you would any app.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-brandblue">
            Back home
          </Link>
          <Link href="/install" className="text-brandblue">
            iPhone or browser install instead
          </Link>
        </div>
      </div>
    </main>
  )
}
