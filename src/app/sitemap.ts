import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { siteUrl } from '@/lib/site'

// Built on request. Google fetches a sitemap rarely, so there is nothing
// to gain from caching it, and this avoids a stale list of drivers.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().replace(/\/$/, '')
  const now = new Date()

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/fare`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/install`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Every active driver's public card. These are the pages actually worth
  // finding in search — someone looking for a taxi in their own area.
  //
  // Read with the service role because anon cannot select profiles
  // directly; the public card goes through a SECURITY DEFINER function.
  // Only the slug leaves this function, and a slug is already public.
  //
  // Selects nothing but the slug on purpose: naming a column that does
  // not exist would fail the whole query and silently drop every driver
  // from the sitemap.
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('slug')
      .eq('is_active', true)
      .not('slug', 'is', null)
      .limit(5000)

    if (error) {
      console.error('[sitemap] could not list drivers:', error.message)
    }

    for (const row of (data as { slug: string | null }[] | null) ?? []) {
      if (!row.slug) continue
      pages.push({
        url: `${base}/${row.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  } catch (err) {
    // A missing service key should still leave a valid sitemap rather
    // than an error page Google cannot read.
    console.error('[sitemap] driver lookup failed:', err)
  }

  return pages
}
