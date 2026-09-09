import { createClient } from '@supabase/supabase-js'

/**
 * A plain Supabase client used only to request password-reset emails.
 *
 * @supabase/ssr forces the PKCE flow, which ties a reset link to the one
 * browser that asked for it — open it anywhere else and it fails. This
 * client asks for the implicit flow instead, so the link carries the
 * session in the URL fragment and works in any browser.
 *
 * persistSession is off: this client only sends the email, it never signs
 * anyone in, so it must not touch the session the rest of the app uses.
 */
export function createImplicitClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'implicit',
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}
