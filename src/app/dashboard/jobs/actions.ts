'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ClaimJobResult = {
  error?: string
  customer_name?: string
  customer_phone?: string
}

export async function claimDispatchJob(id: string): Promise<ClaimJobResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('claim_dispatch_job', { p_id: id })

  if (error) {
    if (error.message.includes('already_taken')) {
      return { error: 'Another driver took that one first.' }
    }
    if (error.message.includes('not_allowed')) {
      return { error: 'Jobs are for business accounts only.' }
    }
    return { error: 'Could not take that job.' }
  }

  revalidatePath('/dashboard', 'layout')
  const row = data as { customer_name: string; customer_phone: string }
  return { customer_name: row.customer_name, customer_phone: row.customer_phone }
}
