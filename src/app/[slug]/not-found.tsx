import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-navy">No driver here</h1>
      <p className="mt-2 text-slate-600">
        This booking link does not belong to anyone. Check the spelling, or
        ask your driver for their QR code again.
      </p>
      <Link href="/" className="mt-6 text-sm font-medium text-blue-700">
        About TaxiCard
      </Link>
    </main>
  )
}
