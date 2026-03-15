import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FeedClient from '@/components/feed/feed-client'

export type FeedPostRow = {
  id: string
  user_id: string
  user_full_name: string | null
  user_avatar_url: string | null
  user_is_vip: boolean | null
  content: string
  image_url: string | null
  status: string
  report_count: number
  like_count: number
  comment_count: number
  is_hidden_by_admin: boolean
  created_at: string
}

type RawFeedProfileRow = {
  full_name: string | null
  avatar_url: string | null
  is_vip: boolean | null
}

type RawFeedPostRow = {
  id: string
  user_id: string
  content: string | null
  image_url: string | null
  status: string
  report_count: number | null
  like_count: number | null
  comment_count: number | null
  is_hidden_by_admin: boolean | null
  created_at: string
  profiles: RawFeedProfileRow[] | null
}

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: me } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, is_vip, can_create_feed_posts, daily_feed_post_limit')
    .eq('id', user.id)
    .maybeSingle()

  const { data: posts, error } = await supabase
    .from('feed_posts')
    .select(`
      id,
      user_id,
      content,
      image_url,
      status,
      report_count,
      like_count,
      comment_count,
      is_hidden_by_admin,
      created_at,
      profiles!feed_posts_user_id_fkey (
        full_name,
        avatar_url,
        is_vip
      )
    `)
    .eq('status', 'approved')
    .eq('is_hidden_by_admin', false)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được feed: {error.message}
      </div>
    )
  }

  const normalizedPosts: FeedPostRow[] = ((posts || []) as unknown as RawFeedPostRow[]).map(
    (item) => {
      const profile = item.profiles?.[0] ?? null

      return {
        id: item.id,
        user_id: item.user_id,
        user_full_name: profile?.full_name ?? null,
        user_avatar_url: profile?.avatar_url ?? null,
        user_is_vip: profile?.is_vip ?? null,
        content: item.content ?? '',
        image_url: item.image_url ?? null,
        status: item.status,
        report_count: Number(item.report_count || 0),
        like_count: Number(item.like_count || 0),
        comment_count: Number(item.comment_count || 0),
        is_hidden_by_admin: Boolean(item.is_hidden_by_admin),
        created_at: item.created_at,
      }
    }
  )

  return <FeedClient currentUser={me} initialPosts={normalizedPosts} />
}