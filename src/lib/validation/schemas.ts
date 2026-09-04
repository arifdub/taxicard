import { z } from 'zod'

export const RESERVED = new Set([
  'admin', 'api', 'auth', 'login', 'logout', 'signup', 'register',
  'dashboard', 'bookings', 'customers', 'settings', 'card', 'b',
  'driver', 'drivers', 'app', 'www', 'help', 'support', 'terms',
  'privacy', 'pricing', 'about', 'contact',
])

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'At least 3 characters')
  .max(30, 'At most 30 characters')
  .regex(
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/,
    'Lowercase letters, numbers and hyphens only'
  )
  .refine((s) => !RESERVED.has(s), 'That link is reserved')

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})

// Irish mobiles are 10 digits starting 08. Kept permissive so
// international numbers still pass.
const phone = z
  .string()
  .trim()
  .refine((v) => v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number')

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  slug: slugSchema,
  phone,
  whatsapp_phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null),
  business_name: emptyToNull(60),
  licence_number: emptyToNull(40),
  vehicle_make: emptyToNull(40),
  vehicle_model: emptyToNull(40),
  vehicle_registration: emptyToNull(20),
  service_area: emptyToNull(120),
  description: emptyToNull(280),
})

function emptyToNull(max: number) {
  return z
    .string()
    .trim()
    .max(max, `At most ${max} characters`)
    .optional()
    .transform((v) => (v && v.length ? v : null))
}

export type ProfileInput = z.infer<typeof profileSchema>
