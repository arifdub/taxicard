/**
 * Logo mark plus wordmark, drawn inline so it needs no image file.
 */
export default function Wordmark({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const dim = { sm: 32, md: 44, lg: 56 }[size]
  const text = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }[size]

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 64 64"
        role="img"
        aria-label="TaxiCard"
        className="shrink-0"
      >
        <rect width="64" height="64" rx="14" fill="#0A0B0D" />
        <rect x="7" y="16" width="50" height="32" rx="6" fill="#FFC72C" />
        {/* taxi chequer along the top of the card */}
        <g fill="#0A0B0D">
          <rect x="7" y="16" width="6" height="4" />
          <rect x="19" y="16" width="6" height="4" />
          <rect x="31" y="16" width="6" height="4" />
          <rect x="43" y="16" width="6" height="4" />
          <rect x="13" y="20" width="6" height="4" />
          <rect x="25" y="20" width="6" height="4" />
          <rect x="37" y="20" width="6" height="4" />
          <rect x="49" y="20" width="6" height="4" />
        </g>
        {/* card detail lines */}
        <rect x="13" y="30" width="20" height="4" rx="2" fill="#0A0B0D" />
        <rect x="13" y="38" width="13" height="4" rx="2" fill="#0A0B0D" opacity="0.5" />
        {/* taxi roof sign */}
        <rect x="38" y="29" width="14" height="6" rx="2" fill="#0A0B0D" />
        <path
          d="M37 39h16v5a1 1 0 0 1-1 1h-1.6a2.4 2.4 0 0 1-4.8 0h-1.2a2.4 2.4 0 0 1-4.8 0H38a1 1 0 0 1-1-1z"
          fill="#0A0B0D"
        />
      </svg>
      <span className={`${text} font-semibold tracking-tight`}>
        <span className="text-white">Taxi</span>
        <span className="text-yellow">Card</span>
      </span>
    </span>
  )
}
