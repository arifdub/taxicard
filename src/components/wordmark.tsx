import Image from 'next/image'

/**
 * Logo mark plus wordmark. The mark is the card on its own, because the
 * full app icon includes a wordmark of its own that turns to mush below
 * about 96 pixels.
 */
export default function Wordmark({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const dims = { sm: 26, md: 32, lg: 40 }[size]
  const text = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' }[size]

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo-mark.png"
        alt=""
        width={dims}
        height={dims}
        priority
        className="rounded-md"
      />
      <span className={`${text} font-semibold tracking-tight`}>
        <span className="text-white">Taxi</span>
        <span className="text-yellow">Card</span>
      </span>
    </span>
  )
}
