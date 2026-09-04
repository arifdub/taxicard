import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TaxiCard',
  description:
    'A digital business card and booking page for independent taxi drivers.',
  appleWebApp: { capable: true, title: 'TaxiCard', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  themeColor: '#0F1B33',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  )
}
