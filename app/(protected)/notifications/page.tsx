import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NotificationsClient from '@/components/notifications/notifications-client'

export type NotificationRow = {
  id: string
  actor_user_id: string | null
  actor_full_name: string | null
  actor_avatar_url: string | null
  actor_is_vip: boolean | null
  type: string
  title: string
  body: string | null
  href: string | null
  post_id: string | null
  comment_id: string | null
  is_read: boolean
  created_at: string
}

export type UnseenFeedPostRow = {
  id: string
  user_id: string
  user_full_name: string | null
  user_avatar_url: string | null
  user_is_vip: boolean | null
  content: string | null
  image_url: string | null
  created_at: string
}

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: notificationsData, error: notificationsError } = await supabase.rpc(
    'get_my_notifications'
  )

  if (notificationsError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được thông báo: {notificationsError.message}
      </div>
    )
  }

  const { data: feedData, error: feedError } = await supabase.rpc(
    'get_unseen_feed_posts'
  )

  if (feedError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được thông báo feed mới: {feedError.message}
      </div>
    )
  }

  return (
    <NotificationsClient
      initialNotifications={(notificationsData || []) as NotificationRow[]}
      initialFeedNotifications={(feedData || []) as UnseenFeedPostRow[]}
    />
  )
}