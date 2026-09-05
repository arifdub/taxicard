'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Fades and slides its children in when they scroll into view. Used
 * rather than a plain load animation because most of these sections sit
 * below the fold, where a load animation would finish unseen.
 */
export default function Reveal({
  children,
  from = 'up',
  delay = 0,
  className = '',
}: {
  children: ReactNode
  from?: 'up' | 'left' | 'right'
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Anything already on screen shows immediately, so nothing is stuck
    // invisible on a tall desktop window.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  const dir =
    from === 'left' ? 'tc-rv-left' : from === 'right' ? 'tc-rv-right' : ''

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`tc-rv ${dir} ${shown ? 'is-in' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
