import { redirect } from 'next/navigation'

// Disabled for now — posting a job to every business driver at once reads
// too close to unlicensed dispatch. The form and its RPC are left in place
// under find-form.tsx / actions.ts so this can be turned back on later.
export default function FindPage() {
  redirect('/')
}
