import { createBrowserClient } from '@supabase/ssr'

/**
 * A browser client that uses the implicit flow rather than PKCE.
 *
 * PKCE stores a verifier in the browser that made the request, so a reset
 * link only works in that same browser — ask on your phone, open on a
 * laptop, and it fails. Implicit returns the session in the URL fragment
 * instead, which works anywhere and is still never sent to a server.
 *
 * Used only for password-reset requests; the rest of the app stays on the
 * default client.
 */
export function createImplicitClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { flowType: 'implicit' } }
  )
}
