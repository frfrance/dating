'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import VipBadge from '@/components/profile/vip-badge'

type AdminFeedPostRow = {
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

export default function AdminFeedPostsTable({
  posts,
}: {
  posts: AdminFeedPostRow[]
}) {
  const supabase = createClient()
  const [rows, setRows] = useState(posts)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function handleToggleHidden(post: AdminFeedPostRow) {
    try {
      setSavingId(post.id)

      const nextHidden = !post.is_hidden_by_admin

      const { error } = await supabase.rpc('admin_set_feed_post_hidden', {
        p_post_id: post.id,
        p_hidden: nextHidden,
      })

      if (error) {
        throw new Error(error.message)
      }

      setRows((prev) =>
        prev.map((item) =>
          item.id === post.id
            ? {
                ...item,
                is_hidden_by_admin: nextHidden,
                status: nextHidden ? 'hidden' : 'approved',
              }
            : item
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra.'
      alert(message)
    } finally {
      setSavingId(null)
    }
  }

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return rows

    return rows.filter((row) => {
      const name = (row.user_full_name || '').toLowerCase()
      const content = (row.content || '').toLowerCase()
      return name.includes(keyword) || content.includes(keyword)
    })
  }, [rows, search])

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Tìm kiếm bài viết
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nhập tên người đăng hoặc nội dung..."
          className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-black outline-none"
        />
      </div>

      {filteredRows.map((post) => (
        <div
          key={post.id}
          className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-pink-100">
                {post.user_avatar_url ? (
                  <img
                    src={post.user_avatar_url}
                    alt={post.user_full_name || 'Avatar'}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold text-gray-900">
                    {post.user_full_name || 'Người dùng'}
                  </div>
                  <VipBadge isVip={post.user_is_vip} />
                </div>

                <div className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </div>

              <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {post.status}
              </div>
            </div>

            <div className="mt-4 whitespace-pre-wrap text-gray-800">{post.content}</div>
          </div>

          {post.image_url ? (
            <div className="border-y border-gray-100 bg-gray-50">
              <img
                src={post.image_url}
                alt="Ảnh bài viết"
                className="max-h-[520px] w-full object-cover"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm text-gray-500">
            <span>{post.like_count} thích</span>
            <span>{post.comment_count} bình luận</span>
            <span>{post.report_count} báo cáo</span>
            {post.is_hidden_by_admin ? (
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
                Đã ẩn bởi admin
              </span>
            ) : null}
          </div>

          <div className="border-t border-gray-100 px-5 py-4">
            <button
              type="button"
              onClick={() => handleToggleHidden(post)}
              disabled={savingId === post.id}
              className="rounded-2xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
            >
              {savingId === post.id
                ? 'Đang xử lý...'
                : post.is_hidden_by_admin
                ? 'Bỏ ẩn bài viết'
                : 'Ẩn bài viết'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}