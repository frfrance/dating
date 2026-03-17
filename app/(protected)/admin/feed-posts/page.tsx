import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminFeedPostsTable from '@/components/admin/admin-feed-posts-table'

type AdminFeedPostRow = {
  id: string
  user_id: string
  user_full_name: string | null
  user_avatar_url: string | null
  user_is_vip: boolean | null
  content: string
  image_url: string | null
  like_count: number
  comment_count: number
  report_count: number
  status: 'approved' | 'hidden' | 'pending_review'
  is_hidden_by_admin: boolean
  created_at: string
}

type RawAdminFeedPostRow = {
  id: string
  user_id: string
  user_full_name: string | null
  user_avatar_url: string | null
  user_is_vip: boolean | null
  content: string | null
  image_url: string | null
  like_count: number | null
  comment_count: number | null
  report_count: number | null
  status: 'approved' | 'hidden' | 'pending_review'
  is_hidden_by_admin: boolean | null
  created_at: string
}

function AdminFeedPostsFallback() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
      Đang tải danh sách bài viết feed...
    </div>
  )
}

export default async function AdminFeedPostsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: me } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!me?.is_admin) {
    redirect('/discover')
  }

  const { data, error } = await supabase.rpc('admin_get_feed_posts')

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được danh sách bài viết feed: {error.message}
      </div>
    )
  }

  const normalizedPosts: AdminFeedPostRow[] = (
    (data || []) as RawAdminFeedPostRow[]
  ).map((item) => ({
    id: item.id,
    user_id: item.user_id,
    user_full_name: item.user_full_name ?? null,
    user_avatar_url: item.user_avatar_url ?? null,
    user_is_vip: item.user_is_vip ?? null,
    content: item.content ?? '',
    image_url: item.image_url ?? null,
    like_count: Number(item.like_count || 0),
    comment_count: Number(item.comment_count || 0),
    report_count: Number(item.report_count || 0),
    status: item.status,
    is_hidden_by_admin: Boolean(item.is_hidden_by_admin),
    created_at: item.created_at,
  }))

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bài viết Feed</h1>
        <p className="mt-2 text-sm text-gray-600">
          Xem, ẩn hoặc khôi phục các bài viết trong feed.
        </p>
      </div>

      <Suspense fallback={<AdminFeedPostsFallback />}>
        <AdminFeedPostsTable posts={normalizedPosts} />
      </Suspense>
    </main>
  )
}