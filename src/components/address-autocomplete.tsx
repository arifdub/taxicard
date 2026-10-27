'use client'

import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react'

type Suggestion = { id: string; description: string }

/**
 * A plain text input that suggests addresses as you type, backed by
 * Google Places. Forwards its ref to the real <input>, so it drops
 * straight into a form that already fills or reads the field by ref
 * (saved details, "use my location") without any other changes there —
 * this only adds suggestions on top of typing.
 */
const AddressAutocomplete = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function AddressAutocomplete(props, forwardedRef) {
  const innerRef = useRef<HTMLInputElement | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestId = useRef(0)

  function setRefs(node: HTMLInputElement | null) {
    innerRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
  }

  function fetchSuggestions(query: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      const id = ++requestId.current
      try {
        const res = await fetch(
          `/api/geocode/autocomplete?input=${encodeURIComponent(query)}`
        )
        const data = await res.json()
        if (id !== requestId.current) return // a later keystroke already replaced this
        const next = (data.suggestions ?? []) as Suggestion[]
        setSuggestions(next)
        setOpen(next.length > 0)
        setHighlighted(-1)
      } catch {
        // Silent — the plain text field still works without suggestions.
      }
    }, 250)
  }

  function choose(s: Suggestion) {
    const el = innerRef.current
    if (el) {
      // A direct el.value = ... would not notify React in a controlled
      // field, so set it through the native setter and dispatch the event
      // React listens for, same trick "use my location" would need too.
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set
      setter?.call(el, s.description)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.focus()
    }
    setOpen(false)
    setSuggestions([])
  }

  return (
    <div className="relative">
      <input
        {...props}
        ref={setRefs}
        autoComplete="off"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          props.onChange?.(e)
          fetchSuggestions(e.target.value)
        }}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          props.onKeyDown?.(e)
          if (!open || suggestions.length === 0) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlighted((h) => Math.min(h + 1, suggestions.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlighted((h) => Math.max(h - 1, 0))
          } else if (e.key === 'Enter' && highlighted >= 0) {
            e.preventDefault()
            choose(suggestions[highlighted])
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
        onBlur={(e: FocusEvent<HTMLInputElement>) => {
          props.onBlur?.(e)
          // Give a suggestion's onClick a moment to register before the
          // list disappears out from under it.
          setTimeout(() => setOpen(false), 150)
        }}
      />

      {open ? (
        <ul className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-white/10 bg-navy-soft shadow-xl">
          {suggestions.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(s)}
                className={`block w-full px-3.5 py-2.5 text-left text-sm ${
                  i === highlighted
                    ? 'bg-white/10 text-white'
                    : 'text-slate-200'
                }`}
              >
                {s.description}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
})

export default AddressAutocomplete
