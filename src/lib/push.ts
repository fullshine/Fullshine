import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/server'

webpush.setVapidDetails(
  'mailto:centrolibrepiensa@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushToAdmin(title: string, body: string, url = '/admin/dashboard') {
  try {
    const supabase = createAdminClient()
    const { data: subs } = await supabase.from('push_subscriptions').select('subscription')
    if (!subs?.length) return

    const payload = JSON.stringify({ title, body, url })
    await Promise.allSettled(
      subs.map(row => webpush.sendNotification(JSON.parse(row.subscription), payload))
    )
  } catch (e) {
    console.error('[Push]', e)
  }
}
