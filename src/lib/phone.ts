// Irish numbers are written 087…; wa.me needs a country code.
export function whatsappNumber(raw: string) {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('353')) return digits
  if (digits.startsWith('0')) return `353${digits.slice(1)}`
  return digits
}

export function telHref(raw: string) {
  return `tel:${raw.replace(/\s/g, '')}`
}
