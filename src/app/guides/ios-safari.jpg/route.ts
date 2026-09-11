import { iosSafari } from '@/lib/guides'

export const dynamic = 'force-static'

export function GET() {
  return new Response(Buffer.from(iosSafari, 'base64'), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
