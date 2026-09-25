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
    'Independent Irish taxi drivers get a digital business card, a QR code for the car, and their own private customer list. Passengers save your contact and reach you directly, with no app to download.',

  applicationName: 'TaxiCard',
  keywords: [
    'taxi Ireland',
    'taxi business card',
    'taxi QR code',
    'SPSV driver',
    'digital business card for taxi drivers',
  ],

  alternates: { canonical: '/' },

  // Search engine ownership checks. Google is verified by DNS and needs
  // nothing here; Bing's tag goes under `other` because Next has no
  // named field for it.
  verification: {
    other: {
      'msvalidate.01': '1E8FF22534CB4B71236D16BFBFB5A7C1',
    },
  },

  openGraph: {
    type: 'website',
    siteName: 'TaxiCard',
    locale: 'en_IE',
    url: SITE,
    title: 'TaxiCard — a digital business card for Irish taxi drivers',
    description:
      'Turn every passenger into a regular customer. A digital taxi business card they can contact you through directly.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'TaxiCard — a digital business card for Irish taxi drivers',
    description:
      'Turn every passenger into a regular customer. A digital taxi business card they can contact you through directly.',
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
