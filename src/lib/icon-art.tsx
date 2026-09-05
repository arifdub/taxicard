import { ImageResponse } from 'next/og'

/**
 * The app icon, drawn in code rather than shipped as a PNG. Next renders
 * these to images at build time, so branding needs no binary uploads.
 */
export function iconImage(size: number, maskable = false) {
  const pad = maskable ? size * 0.16 : size * 0.06
  const cardW = size - pad * 2
  const cardH = cardW * 0.62

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0B0D',
          borderRadius: maskable ? 0 : size * 0.22,
        }}
      >
        <div
          style={{
            width: cardW,
            height: cardH,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: '#FFC72C',
            borderRadius: size * 0.075,
            paddingLeft: size * 0.075,
            border: `${Math.max(2, size * 0.012)}px solid #E0A800`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <div
              style={{
                fontSize: size * 0.155,
                fontWeight: 700,
                color: '#0A0B0D',
                letterSpacing: -size * 0.004,
              }}
            >
              Taxi
            </div>
            <div
              style={{
                fontSize: size * 0.155,
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: -size * 0.004,
              }}
            >
              Card
            </div>
          </div>
          <div
            style={{
              fontSize: size * 0.055,
              fontWeight: 600,
              color: '#0A0B0D',
              opacity: 0.75,
              letterSpacing: size * 0.012,
              marginTop: size * 0.012,
            }}
          >
            TAP. BOOK. RIDE.
          </div>
        </div>
      </div>
    ),
    { width: size, height: size }
  )
}
