'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { pushToDriver } from '@/lib/push'

export type MessageState = { error?: string; message?: string }

const schema = z.object({
  title: z.string().trim().min(2, 'Write a short subject'),
  body: z.string().trim().max(600).optional(),
  audience: z.enum(['ALL', 'BUSINESS', 'PRO']),
})

export async function sendBroadcast(
  _prev: MessageState,
  formData: FormData
): Promise<MessageState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const v = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('broadcast_message', {
    p_title: v.title,
    p_body: v.body || null,
    p_audience: v.audience,
  })

  if (error) {
    if (error.message.includes('not_allowed')) {
      return { error: 'Only administrators can send messages.' }
    }
    return { error: 'Could not send that message.' }
  }

  const sent = (data as { sent?: number } | null)?.sent ?? 0

  // Push as well, so it reaches a phone that is not open.
  try {
    let q = supabase.from('profiles').select('id').eq('is_active', true)
    if (v.audience === 'BUSINESS') q = q.eq('is_business', true)
    if (v.audience === 'PRO') q = q.eq('is_pro', true)

    const { data: rows } = await q
    await Promise.all(
      ((rows as { id: string }[] | null) ?? []).map((r) =>
        pushToDriver(r.id, {
          title: v.title,
          body: v.body || 'Open TaxiCard to read it.',
          url: '/dashboard/notifications',
          tag: 'broadcast',
        })
      )
    )
  } catch {
    // The notification is already saved; a push failure is not fatal.
  }

  revalidatePath('/admin/messages')
  revalidatePath('/dashboard', 'layout')

  return {
    message: `Sent to ${sent} driver${sent === 1 ? '' : 's'}.`,
  }
}
