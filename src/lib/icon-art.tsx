import { ImageResponse } from 'next/og'
import { LOGO_MARK } from '@/lib/brand'

/**
 * App and favicon artwork, rendered from the brand mark at build time so
 * there is no image file in /public to go missing.
 */
export function iconImage(size: number, maskable = false) {
  // Android crops maskable icons to a circle, so the badge sits smaller.
  const badge = Math.round(size * (maskable ? 0.6 : 0.82))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0B0C',
          borderRadius: maskable ? 0 : size * 0.22,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_MARK} alt="" width={badge} height={badge} />
      </div>
    ),
    { width: size, height: size }
  )
}
