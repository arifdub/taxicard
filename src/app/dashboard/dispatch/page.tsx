import { redirect } from 'next/navigation'

/**
 * The old office list. Everything it did now lives in Jobs, under the
 * Sent tab and the Create job button, so send people there rather than
 * keeping two pages that drift apart.
 */
export default function OfficeDispatchRedirect() {
  redirect('/dashboard/jobs?tab=sent')
}
