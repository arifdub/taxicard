import Link from 'next/link'
import type { Metadata } from 'next'
import Wordmark from '@/components/wordmark'
import GuidePicker from './guide-picker'

export const metadata: Metadata = {
  title: 'How to install TaxiCard on your phone',
  description:
    'Step by step pictures for adding TaxiCard to your home screen on iPhone and Android.',
}

export default function InstallPage() {
  return (
    <main className="tc-dark-page w-full px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.5rem)] text-white">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark size="sm" />
        </Link>

        <h1 className="text-2xl font-semibold md:text-3xl">
          Put TaxiCard on your home screen
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Nothing to download from an app store. It takes about twenty
          seconds, and afterwards it opens like any other app. Drivers need
          this to receive booking alerts.
        </p>

        <GuidePicker />

        <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-navy-soft p-5 text-sm text-slate-300">
          <div>
            <p className="font-semibold text-white">Passengers</p>
            <p className="mt-1">
              Install a driver&apos;s card, not this page. Open their link,
              for example taxicard.ie/john, then follow the same steps. The
              icon takes their name, and booking them again is one tap.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Drivers</p>
            <p className="mt-1">
              Log in first, then install from your dashboard. Open it from
              the icon and turn on booking alerts under Profile.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">
              Cannot find the option?
            </p>
            <p className="mt-1">
              On iPhone it lives in the share menu, and you may need to
              scroll down the list. On Android it is under the three dots,
              and may say Install, Install app, or Add to Home screen
              depending on your version of Chrome.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-brandblue">
            Back home
          </Link>
          <Link href="/signup" className="text-brandblue">
            Create a driver account
          </Link>
        </div>
      </div>
    </main>
  )
}
