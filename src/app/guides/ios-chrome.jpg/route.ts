import { iosChrome } from '@/lib/guides'

export const dynamic = 'force-static'

export function GET() {
  return new Response(Buffer.from(iosChrome, 'base64'), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
