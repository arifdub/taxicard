import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl().replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private, signed-in, or single-use pages. A booking status page
        // carries a passenger's name, route and phone number and must
        // never turn up in a search result.
        disallow: [
          '/dashboard',
          '/admin',
          '/auth',
          '/api',
          '/b/',
          '/j/',
          '/reset-password',
          '/guides/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
