import { iconImage } from '@/lib/icon-art'

export const dynamic = 'force-static'

export function GET() {
  return iconImage(512, true)
}
