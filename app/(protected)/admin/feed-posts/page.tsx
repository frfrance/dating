import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminFeedPostsTable from '@/components/admin/admin-feed-posts-table'

type AdminFeedPostRow = {
  id: string
  user_id: string
  user_full_name: string | null
  user_avatar_url: string | null
  user_is_vip: boolean | null
  content: string | null
  image_url: string | null
  like_count: number
  comment_count: number
  report_count: number
  status: 'approved' | 'hidden' | 'pending_review'
  is_hidden_by_admin: boolean
  created_at: string
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

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý bài viết Feed</h1>
        <p className="mt-2 text-sm text-gray-600">
          Xem, ẩn hoặc khôi phục các bài viết trong feed.
        </p>
      </div>

      <AdminFeedPostsTable posts={(data || []) as AdminFeedPostRow[]} />
    </main>
  )
}