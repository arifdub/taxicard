import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold text-navy">TaxiCard</h1>
      <p className="mt-2 text-slate-600">
        Your own booking page and QR code, so the customers who already know
        you can book you in a few taps.
      </p>
      <div className="mt-8 space-y-3">
        <Link
          href="/signup"
          className="block rounded-xl bg-yellow px-4 py-3.5 text-center font-semibold text-navy"
        >
          Create your driver account
        </Link>
        <Link
          href="/login"
          className="block rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-center font-medium"
        >
          Log in
        </Link>
      </div>
    </main>
  )
}
