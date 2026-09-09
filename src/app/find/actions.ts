'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { pushToDriver } from '@/lib/push'

export type FindState = { error?: string }

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, '').length >= 7, 'Enter a valid phone number'),
  pickup: z.string().trim().min(3, 'Enter a pickup address'),
  eircode: z.string().trim().max(10).optional(),
  destination: z.string().trim().optional(),
  when: z.enum(['NOW', 'LATER']),
  scheduled_at: z.string().trim().optional(),
  notes: z.string().trim().max(280).optional(),
})

const MESSAGES: Record<string, string> = {
  invalid_phone: 'Enter a valid phone number.',
  name_required: 'Enter your name.',
  pickup_required: 'Enter a pickup address.',
  invalid_eircode: 'That Eircode does not look right. Leave it blank if unsure.',
  invalid_scheduled_at: 'Pick a date and time in the future.',
  scheduled_too_far: 'That is too far ahead. Pick a nearer date.',
  rate_limited: 'You have posted several times already. Give it a few minutes.',
}

export async function postPublicJob(
  _prev: FindState,
  formData: FormData
): Promise<FindState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const v = parsed.data
  if (v.when === 'LATER' && !v.scheduled_at) {
    return { error: 'Pick a date and time.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_public_dispatch_job', {
    p_customer_name: v.name,
    p_customer_phone: v.phone,
    p_pickup_address: v.pickup,
    p_destination_address: v.destination || null,
    p_booking_type: v.when,
    p_scheduled_at: v.when === 'LATER' ? v.scheduled_at : null,
    p_notes: v.notes || null,
    p_pickup_eircode: v.eircode || null,
  })

  if (error) {
    const key = Object.keys(MESSAGES).find((k) => error.message.includes(k))
    return { error: key ? MESSAGES[key] : 'Could not post that. Try again.' }
  }

  const token = (data as { token?: string } | null)?.token
  if (!token) return { error: 'Could not post that. Try again.' }

  try {
    const { data: ids } = await supabase.rpc('business_driver_ids')
    const list = Array.isArray(ids)
      ? (ids as unknown[]).map((d) =>
          typeof d === 'string' ? d : (d as { business_driver_ids: string }).business_driver_ids
        )
      : []

    await Promise.all(
      list.filter(Boolean).map((id) =>
        pushToDriver(id as string, {
          title: 'New job from the website',
          body: `${v.pickup}${v.destination ? ` → ${v.destination}` : ''}`,
          url: '/dashboard/jobs',
          tag: 'dispatch',
        })
      )
    )
  } catch {
    // A push failure must never lose the job.
  }

  redirect(`/j/${token}`)
}
