/* eslint-disable @next/next/no-img-element */
import { LOGO_MARK } from '@/lib/brand'

/**
 * The TaxiCard mark. The artwork is a data URI from lib/brand, so there
 * is no image file to go missing. The name is set as real text beside it
 * rather than relying on the lettering inside the card, which is not
 * legible at header size.
 */
export default function Wordmark({
  size = 'md',
  showText = true,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}) {
  const h = { sm: 30, md: 40, lg: 52 }[size]
  const text = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }[size]

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={LOGO_MARK}
        alt="TaxiCard"
        width={h}
        height={h}
        style={{ height: h, width: h }}
        className="shrink-0"
      />
      {showText ? (
        <span className={`${text} font-semibold tracking-tight`}>
          <span className="text-white">Taxi</span>
          <span className="text-yellow">Card</span>
        </span>
      ) : null}
    </span>
  )
}
