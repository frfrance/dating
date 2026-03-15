'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type VipRequestRow = {
  id: string
  user_id: string
  phone_number: string
  facebook_link: string
  face_image_url: string
  face_image_storage_path: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  created_at: string
  updated_at: string
  profile: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null
}

type Props = {
  requests: VipRequestRow[]
}

export default function AdminVipRequestsTable({ requests }: Props) {
  const supabase = createClient()
  const [rows, setRows] = useState(requests)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [noteMap, setNoteMap] = useState<Record<string, string>>({})

  async function handleUpdate(requestId: string, status: 'approved' | 'rejected') {
    const note = noteMap[requestId] ?? ''

    try {
      setLoadingId(requestId)

      const { error } = await supabase.rpc('admin_handle_vip_request', {
        p_request_id: requestId,
        p_status: status,
        p_admin_note: note || null,
      })

      if (error) {
        throw new Error(error.message)
      }

      setRows((prev) =>
        prev.map((row) =>
          row.id === requestId
            ? {
                ...row,
                status,
                admin_note: note || null,
              }
            : row
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra.'
      alert(message)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
          Chưa có yêu cầu VIP nào.
        </div>
      ) : null}

      {rows.map((item) => (
        <div
          key={item.id}
          className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                {item.profile?.avatar_url ? (
                  <img
                    src={item.profile.avatar_url}
                    alt={item.profile?.full_name || 'Avatar'}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0">
                <div className="text-lg font-semibold text-gray-900">
                  {item.profile?.full_name || 'Chưa cập nhật tên'}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {item.profile?.email || 'Không có email'}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                    Trạng thái: {item.status}
                  </span>
                  <span className="rounded-full bg-pink-100 px-3 py-1 text-pink-700">
                    SĐT: {item.phone_number}
                  </span>
                </div>
              </div>
            </div>

            <a
              href={item.facebook_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Mở link Facebook
            </a>
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50">
            <img
              src={item.face_image_url}
              alt="Ảnh xác minh"
              className="max-h-[420px] w-full object-cover"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Ghi chú admin
            </label>
            <textarea
              value={noteMap[item.id] ?? item.admin_note ?? ''}
              onChange={(e) =>
                setNoteMap((prev) => ({
                  ...prev,
                  [item.id]: e.target.value,
                }))
              }
              className="min-h-24 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black shadow-sm outline-none"
              placeholder="Ví dụ: ảnh chưa rõ mặt, vui lòng gửi lại..."
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleUpdate(item.id, 'approved')}
              disabled={loadingId === item.id}
              className="rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              Duyệt VIP
            </button>

            <button
              type="button"
              onClick={() => handleUpdate(item.id, 'rejected')}
              disabled={loadingId === item.id}
              className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              Từ chối
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}