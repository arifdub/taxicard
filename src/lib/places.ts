export type PlaceSuggestion = { id: string; description: string }

type AutocompleteResult =
  | { ok: true; suggestions: PlaceSuggestion[] }
  | { ok: false; message: string }

/**
 * Address suggestions via Places API (New). Google has been blocking the
 * classic Places API from being enabled on newer Cloud projects, so this
 * is the endpoint that actually works for a key created today — see
 * REQUEST_DENIED from the legacy endpoint telling you exactly that.
 */
export async function placesAutocomplete(
  key: string,
  input: string
): Promise<AutocompleteResult> {
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
      },
      body: JSON.stringify({ input, includedRegionCodes: ['ie'] }),
      cache: 'no-store',
    })
    const data = await res.json()

    if (!res.ok) {
      return { ok: false, message: data?.error?.message ?? res.statusText }
    }

    type Prediction = {
      placePrediction?: { placeId: string; text?: { text: string } }
    }
    const suggestions = ((data.suggestions ?? []) as Prediction[])
      .filter((s) => s.placePrediction)
      .slice(0, 6)
      .map((s) => ({
        id: s.placePrediction!.placeId,
        description: s.placePrediction!.text?.text ?? '',
      }))

    return { ok: true, suggestions }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'request failed' }
  }
}
