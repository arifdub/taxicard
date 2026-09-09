import Link from 'next/link'
import Wordmark from '@/components/wordmark'
import ConfirmButton from './confirm-button'
import HashHandler from './hash-handler'

export const dynamic = 'force-dynamic'

export default async function RecoverPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; code?: string }>
}) {
  const params = await searchParams
  const hasToken = Boolean((params.token_hash && params.type) || params.code)

  return (
    <main className="tc-dark-page w-full px-5 py-10 text-white">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 inline-block">
          <Wordmark size="sm" />
        </Link>

        <h1 className="text-2xl font-semibold text-white">
          Reset your password
        </h1>

        {hasToken ? (
          <ConfirmButton
            tokenHash={params.token_hash ?? ''}
            type={params.type ?? 'recovery'}
            code={params.code ?? ''}
          />
        ) : (
          <HashHandler />
        )}
      </div>
    </main>
  )
}
