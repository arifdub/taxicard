'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { signupSchema, loginSchema } from '@/lib/validation/schemas'

export type FormState = { error?: string; message?: string }

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  return `${host.startsWith('localhost') ? 'http' : 'https'}://${host}`
}

export async function signUp(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // The handle_new_user trigger reads this to seed the profile row.
      data: { name: parsed.data.name },
      emailRedirectTo: `${await siteUrl()}/auth/confirm`,
    },
  })

  if (error) return { error: error.message }

  redirect('/dashboard/settings?welcome=1')
}

export async function logIn(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  // Deliberately vague: naming which half was wrong tells an attacker
  // whether an email is registered.
  if (error) return { error: 'That email and password do not match.' }

  revalidatePath('/', 'layout')
  const next = String(formData.get('next') || '/dashboard')
  redirect(next.startsWith('/') ? next : '/dashboard')
}

export async function logOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function requestReset(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  if (!email.includes('@')) return { error: 'Enter a valid email' }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/auth/confirm?next=/auth/update-password`,
  })

  // Always the same reply, whether or not the account exists.
  return { message: 'If that email has an account, a reset link is on its way.' }
}
