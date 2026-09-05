import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Gate for every admin page. The database enforces this too — the RLS
 * policies widen only for is_admin — but failing here gives a redirect
 * rather than an empty screen.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin')

  const { data } = await supabase
    .from('profiles')
    .select('is_admin, name')
    .eq('id', user.id)
    .single()

  if (!data?.is_admin) redirect('/dashboard')

  return { supabase, user, name: data.name as string | null }
}
