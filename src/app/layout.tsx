import type { Metadata, Viewport } from 'next'
import './globals.css'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taxicard.ie'

export const metadata: Metadata = {
  // Lets every page use relative canonical and social image paths.
  metadataBase: new URL(SITE),

  title: {
    default: 'TaxiCard — a digital business card for Irish taxi drivers',
    // A driver's card becomes "John Smith · TaxiCard" in search results.
    template: '%s · TaxiCard',
  },

  description:
    'Independent Irish taxi drivers get a digital business card, a QR code for the car, and their own private customer list. Passengers book in a few taps, with no app to download.',

  applicationName: 'TaxiCard',
  keywords: [
    'taxi Ireland',
    'book a taxi',
    'taxi business card',
    'taxi QR code',
    'SPSV driver',
    'private hire booking',
  ],

  alternates: { canonical: '/' },

  openGraph: {
    type: 'website',
    siteName: 'TaxiCard',
    locale: 'en_IE',
    url: SITE,
    title: 'TaxiCard — a digital business card for Irish taxi drivers',
    description:
      'Turn every passenger into a regular customer. A digital taxi card with booking built in.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'TaxiCard — a digital business card for Irish taxi drivers',
    description:
      'Turn every passenger into a regular customer. A digital taxi card with booking built in.',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },

  appleWebApp: {
    capable: true,
    title: 'TaxiCard',
    statusBarStyle: 'black-translucent',
  },
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
    <html lang="en-IE">
      <body className="bg-[#0B1425] text-white antialiased">{children}</body>
    </html>
  )
}
