'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type CustomerState = { error?: string; message?: string }

const schema = z.object({
  name: z.string().trim().min(2, 'Enter a name'),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number'),
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length ? v.toLowerCase() : null))
    .refine((v) => v === null || /.+@.+\..+/.test(v), 'Enter a valid email'),
  favourite_pickup: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => (v && v.length ? v : null)),
  notes: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v && v.length ? v : null)),
})

export async function addCustomer(
  _prev: CustomerState,
  formData: FormData
): Promise<CustomerState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in again.' }

  const { error } = await supabase
    .from('customers')
    .insert({ ...parsed.data, driver_id: user.id })

  if (error) {
    if (error.code === '23505') {
      return { error: 'You already have a customer with that number.' }
    }
    return { error: 'Could not save that customer.' }
  }

  revalidatePath('/dashboard/customers')
  return { message: 'Customer added.' }
}

export async function updateCustomer(
  id: string,
  _prev: CustomerState,
  formData: FormData
): Promise<CustomerState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()

  // RLS keeps this to the driver's own customers.
  const { error } = await supabase
    .from('customers')
    .update(parsed.data)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'Another of your customers already uses that number.' }
    }
    return { error: 'Could not save changes.' }
  }

  revalidatePath('/dashboard/customers')
  return { message: 'Saved.' }
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) return { error: 'Could not delete that customer.' }

  revalidatePath('/dashboard/customers')
  redirect('/dashboard/customers')
}
