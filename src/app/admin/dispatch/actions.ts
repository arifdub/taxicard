'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { pushToDriver } from '@/lib/push'

export type DispatchState = { error?: string; message?: string }

const schema = z.object({
  name: z.string().trim().min(2, 'Enter the customer name'),
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

export async function createDispatchJob(
  _prev: DispatchState,
  formData: FormData
): Promise<DispatchState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()))
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const v = parsed.data
  if (v.when === 'LATER' && !v.scheduled_at) {
    return { error: 'Pick a date and time.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Log in again.' }

  const eircode = (v.eircode ?? '').replace(/\s/g, '').toUpperCase()
  if (eircode && !/^([AC-FHKNPRTV-Y][0-9]{2}|D6W)[0-9AC-FHKNPRTV-Y]{4}$/.test(eircode)) {
    return { error: 'That Eircode does not look right.' }
  }

  const { error } = await supabase.from('dispatch_jobs').insert({
    created_by: user.id,
    customer_name: v.name,
    customer_phone: v.phone,
    pickup_address: v.pickup,
    pickup_eircode: eircode ? `${eircode.slice(0, 3)} ${eircode.slice(3)}` : null,
    destination_address: v.destination || null,
    booking_type: v.when,
    scheduled_at: v.when === 'LATER' ? v.scheduled_at : new Date().toISOString(),
    notes: v.notes || null,
  })

  if (error) return { error: 'Could not send that job. Try again.' }

  // Tell every available business driver. Never let a push failure lose
  // the job — it is already saved by this point.
  try {
    const { data: ids } = await supabase.rpc('business_driver_ids')
    const drivers = (ids as { business_driver_ids: string }[] | string[] | null) ?? []
    const list = Array.isArray(drivers)
      ? drivers.map((d) => (typeof d === 'string' ? d : d.business_driver_ids))
      : []

    await Promise.all(
      list.filter(Boolean).map((id) =>
        pushToDriver(id, {
          title: 'New job available',
          body: `${v.pickup}${v.destination ? ` → ${v.destination}` : ''}`,
          url: '/dashboard/jobs',
          tag: 'dispatch',
        })
      )
    )
  } catch {
    // silent
  }

  revalidatePath('/admin/dispatch')
  return { message: 'Sent to your business drivers.' }
}

export async function cancelDispatchJob(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('dispatch_jobs')
    .update({ status: 'CANCELLED' })
    .eq('id', id)
    .eq('status', 'OPEN')

  if (error) return { error: 'Could not cancel that job.' }

  revalidatePath('/admin/dispatch')
  return { ok: true }
}
