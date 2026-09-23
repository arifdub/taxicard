/**
 * A Google Maps directions link for a pickup, using whatever is most
 * precise: exact GPS coordinates, then the Eircode (precise to a
 * handful of addresses in Ireland), then the plain address text.
 */
export function directionsHref({
  lat,
  lng,
  eircode,
  address,
}: {
  lat?: number | null
  lng?: number | null
  eircode?: string | null
  address?: string | null
}): string | null {
  const destination = lat && lng ? `${lat},${lng}` : eircode || address
  if (!destination) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}
