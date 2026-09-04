// One place that knows the public address, so links read the same
// everywhere. Set NEXT_PUBLIC_SITE_URL to https://taxicard.ie in Vercel.
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    ''
  )
}

// taxicard.ie/john — no scheme, no trailing slash. Easier to read on a
// card, and shorter to say out loud to a customer.
export function prettyLink(slug: string) {
  return `${siteUrl().replace(/^https?:\/\//, '')}/${slug}`
}
