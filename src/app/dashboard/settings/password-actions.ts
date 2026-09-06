'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type ChangeState = { error?: string; message?: string }

const schema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string().min(1, 'Type your password again'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Those passwords do not match',
    path: ['confirm'],
  })

/**
 * Changing a password while already signed in. No email round trip, so
 * nothing can consume the link before it arrives.
 */
export async function changePassword(
  _prev: ChangeState,
  formData: FormData
): Promise<ChangeState> {
  const parsed = schema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in again.' }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) return { error: error.message }

  return { message: 'Password changed. Use it next time you log in.' }
}
