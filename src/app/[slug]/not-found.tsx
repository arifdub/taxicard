import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="tc-dark-page flex w-full flex-col justify-center px-6 py-24 text-center text-white">
      <div className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-semibold text-white">No driver here</h1>
      <p className="mt-2 text-slate-300">
        This booking link does not belong to anyone. Check the spelling, or
        ask your driver for their QR code again.
      </p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-brandblue">
          About TaxiCard
        </Link>
      </div>
    </main>
  )
}
