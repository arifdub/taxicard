import Link from 'next/link'
import type { Metadata } from 'next'
import Wordmark from '@/components/wordmark'
import FindForm from './find-form'

export const metadata: Metadata = {
  title: 'Find a taxi — TaxiCard',
  description:
    'Post your journey and a licensed Irish taxi driver will pick it up. No app, no account.',
}

export default function FindPage() {
  return (
    <main className="tc-dark-page w-full px-5 pb-10 pt-[calc(env(safe-area-inset-top)+1.5rem)] text-white">
      <div className="tc-dark mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark size="sm" />
        </Link>

        <h1 className="tc-left text-2xl font-semibold">Find a driver</h1>
        <p className="tc-left tc-d1 mb-6 mt-1 text-sm text-slate-400">
          No account needed. Tell us where you are going and a licensed
          driver will pick it up.
        </p>

        <FindForm />
      </div>
    </main>
  )
}
