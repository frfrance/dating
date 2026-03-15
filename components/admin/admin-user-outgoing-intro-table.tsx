'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type UserRow = {
  id: string
  full_name: string | null
  email: string | null
  outgoing_intro_limit_mode: 'one_per_day' | 'many_per_day'
  outgoing_intro_daily_limit: number
  allow_intro_messages: boolean
  can_see_who_likes_me: boolean
  is_admin: boolean
  is_vip: boolean
  is_verified_member: boolean
  can_create_feed_posts: boolean
  daily_feed_post_limit: number
  can_upload_feed_images: boolean
}

export default function AdminUserOutgoingIntroTable({
  users,
  currentPage,
  totalPages,
  totalUsers,
  pageSize,
  initialSearch,
}: {
  users: UserRow[]
  currentPage: number
  totalPages: number
  totalUsers: number
  pageSize: number
  initialSearch: string
}) {
  const supabase = createClient()
  const router = useRouter()

  const [rows, setRows] = useState(users)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState(initialSearch)

  function updateRow(id: string, patch: Partial<UserRow>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  async function saveRow(row: UserRow) {
    try {
      setSavingId(row.id)
      setMessage('')

      const finalMessageLimit = Math.max(0, row.outgoing_intro_daily_limit || 0)
      const finalOutgoingMode =
        finalMessageLimit <= 1 ? 'one_per_day' : 'many_per_day'

      const finalIsVip = row.is_vip
      const finalIsVerifiedMember = row.is_vip

      const finalCanCreateFeedPosts = row.can_create_feed_posts || row.is_vip
      const finalFeedLimit = finalCanCreateFeedPosts
        ? Math.max(1, row.daily_feed_post_limit || 1)
        : 0

      const finalCanUploadFeedImages =
        finalCanCreateFeedPosts && row.can_upload_feed_images

      const { error } = await supabase
        .from('profiles')
        .update({
          outgoing_intro_limit_mode: finalOutgoingMode,
          outgoing_intro_daily_limit: finalMessageLimit,
          can_see_who_likes_me: row.can_see_who_likes_me,
          is_vip: finalIsVip,
          is_verified_member: finalIsVerifiedMember,
          can_create_feed_posts: finalCanCreateFeedPosts,
          daily_feed_post_limit: finalFeedLimit,
          can_upload_feed_images: finalCanUploadFeedImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)

      if (error) {
        setMessage(`Lỗi: ${error.message}`)
        return
      }

      updateRow(row.id, {
        outgoing_intro_limit_mode: finalOutgoingMode,
        outgoing_intro_daily_limit: finalMessageLimit,
        is_verified_member: finalIsVerifiedMember,
        can_create_feed_posts: finalCanCreateFeedPosts,
        daily_feed_post_limit: finalFeedLimit,
        can_upload_feed_images: finalCanUploadFeedImages,
      })

      setMessage('Đã lưu thay đổi.')
    } finally {
      setSavingId(null)
    }
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const keyword = search.trim()

    if (keyword) {
      router.push(`/admin/users?page=1&q=${encodeURIComponent(keyword)}`)
      return
    }

    router.push('/admin/users?page=1')
  }

  function handleClearSearch() {
    setSearch('')
    router.push('/admin/users?page=1')
  }

  const visibleFrom = totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const visibleTo = Math.min(currentPage * pageSize, totalUsers)

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-2 text-sm text-gray-600">
            Quản lý tin nhắn làm quen, quyền xem ai đã thích họ, VIP và quyền đăng feed/ảnh feed.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Đang xem người dùng {visibleFrom} - {visibleTo} trên tổng {totalUsers} · Trang{' '}
            {currentPage}/{totalPages}
          </p>
        </div>

        <div className="w-full md:max-w-sm">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Tìm kiếm toàn bộ người dùng
          </label>

          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nhập tên hoặc email..."
                className="h-12 w-full bg-transparent text-black outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="rounded-2xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600"
              >
                Tìm kiếm
              </button>

              <button
                type="button"
                onClick={handleClearSearch}
                className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Xóa lọc
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
        <strong>Giải thích:</strong> “Số tin nhắn/ngày” là số tin nhắn làm quen tối đa mà người dùng được phép gửi cho người lạ trong ngày.
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
            Không tìm thấy người dùng phù hợp.
          </div>
        ) : null}

        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xl font-semibold text-gray-900">
                    {row.full_name || 'Chưa cập nhật tên'}
                  </div>

                  {row.is_admin ? (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      Admin
                    </span>
                  ) : null}

                  {row.is_vip ? (
                    <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-700">
                      VIP
                    </span>
                  ) : null}
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  {row.email || 'Không có email'}
                </div>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => saveRow(row)}
                  disabled={savingId === row.id}
                  className="rounded-2xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
                >
                  {savingId === row.id ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="mb-4 text-sm font-semibold text-gray-900">
                  Tin nhắn làm quen
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Số tin nhắn/ngày
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={row.outgoing_intro_daily_limit || 0}
                      onChange={(e) =>
                        updateRow(row.id, {
                          outgoing_intro_daily_limit: Number(e.target.value || 0),
                        })
                      }
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-black"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Xem ai đã thích họ
                    </label>
                    <select
                      value={row.can_see_who_likes_me ? 'yes' : 'no'}
                      onChange={(e) =>
                        updateRow(row.id, {
                          can_see_who_likes_me: e.target.value === 'yes',
                        })
                      }
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-black"
                    >
                      <option value="no">Không</option>
                      <option value="yes">Có</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="mb-4 text-sm font-semibold text-gray-900">
                  Feed & VIP
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      VIP
                    </label>
                    <select
                      value={row.is_vip ? 'yes' : 'no'}
                      onChange={(e) => {
                        const nextVip = e.target.value === 'yes'
                        updateRow(row.id, {
                          is_vip: nextVip,
                          can_create_feed_posts: nextVip ? true : row.can_create_feed_posts,
                          daily_feed_post_limit: nextVip
                            ? Math.max(1, row.daily_feed_post_limit || 1)
                            : row.daily_feed_post_limit,
                        })
                      }}
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-black"
                    >
                      <option value="no">Không</option>
                      <option value="yes">Có</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Được đăng feed
                    </label>
                    <select
                      value={row.can_create_feed_posts ? 'yes' : 'no'}
                      onChange={(e) =>
                        updateRow(row.id, {
                          can_create_feed_posts: e.target.value === 'yes',
                          can_upload_feed_images:
                            e.target.value === 'yes' ? row.can_upload_feed_images : false,
                        })
                      }
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-black"
                    >
                      <option value="no">Không</option>
                      <option value="yes">Có</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Được đăng ảnh feed
                    </label>
                    <select
                      value={row.can_upload_feed_images ? 'yes' : 'no'}
                      onChange={(e) =>
                        updateRow(row.id, {
                          can_upload_feed_images:
                            row.can_create_feed_posts && e.target.value === 'yes',
                        })
                      }
                      disabled={!row.can_create_feed_posts}
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-black disabled:bg-gray-100"
                    >
                      <option value="no">Không</option>
                      <option value="yes">Có</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Số bài feed tối đa mỗi ngày
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={row.can_create_feed_posts ? row.daily_feed_post_limit : 0}
                      onChange={(e) =>
                        updateRow(row.id, {
                          daily_feed_post_limit: Number(e.target.value),
                        })
                      }
                      disabled={!row.can_create_feed_posts}
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-black disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  VIP mới đăng ký vẫn có thể giữ mặc định không được đăng ảnh. Ở đây admin có thể bật riêng từng người.
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}