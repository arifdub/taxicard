'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { RECOVERY_COOKIE } from '@/lib/recovery'

export type PasswordState = { error?: string }

const schema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string().min(1, 'Type your password again'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Those passwords do not match',
    path: ['confirm'],
  })

export async function updatePassword(
  _prev: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const parsed = schema.safeParse({
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const store = await cookies()
  if (!store.get(RECOVERY_COOKIE)) {
    return { error: 'That link has expired. Ask for a new one.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'That link has expired. Ask for a new one.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) return { error: error.message }

  // One change per link.
  store.delete(RECOVERY_COOKIE)

  redirect('/dashboard?password=changed')
}
