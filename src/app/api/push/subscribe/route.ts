import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorised' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const endpoint = body?.endpoint
  const p256dh = body?.keys?.p256dh
  const auth = body?.keys?.auth

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'bad subscription' }, { status: 400 })
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      driver_id: user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: request.headers.get('user-agent'),
    },
    { onConflict: 'endpoint' }
  )

  if (error) {
    return NextResponse.json({ error: 'could not save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorised' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.endpoint) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', body.endpoint)
    .eq('driver_id', user.id)

  return NextResponse.json({ ok: true })
}
