'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="w-full rounded-2xl bg-yellow px-4 py-4 text-base font-semibold text-navy"
    >
      Print or save as PDF
    </button>
  )
}
