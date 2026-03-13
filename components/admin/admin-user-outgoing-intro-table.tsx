'use client'

import { useState } from 'react'
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
}

export default function AdminUserOutgoingIntroTable({
  users,
}: {
  users: UserRow[]
}) {
  const supabase = createClient()
  const [rows, setRows] = useState(users)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  function updateRow(id: string, patch: Partial<UserRow>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  async function saveRow(row: UserRow) {
    try {
      setSavingId(row.id)
      setMessage('')

      const finalLimit =
        row.outgoing_intro_limit_mode === 'one_per_day'
          ? 1
          : Math.max(1, row.outgoing_intro_daily_limit || 1)

      const { error } = await supabase
        .from('profiles')
        .update({
          outgoing_intro_limit_mode: row.outgoing_intro_limit_mode,
          outgoing_intro_daily_limit: finalLimit,
          can_see_who_likes_me: row.can_see_who_likes_me,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)

      if (error) {
        setMessage(`Lỗi: ${error.message}`)
        return
      }

      setMessage('Đã lưu thay đổi.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
      <p className="mt-2 text-sm text-gray-600">
        Chỉnh quyền gửi lời nhắn cho người lạ và quyền xem ai đã thích họ.
      </p>

      {message ? (
        <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {message}
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid gap-4 rounded-2xl border border-gray-200 p-4 md:grid-cols-6"
          >
            <div className="md:col-span-2">
              <div className="font-semibold text-gray-900">
                {row.full_name || 'Chưa cập nhật tên'}
              </div>
              <div className="text-sm text-gray-500">{row.email || 'Không có email'}</div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Gửi/ngày
              </label>
              <select
                value={row.outgoing_intro_limit_mode}
                onChange={(e) =>
                  updateRow(row.id, {
                    outgoing_intro_limit_mode: e.target.value as
                      | 'one_per_day'
                      | 'many_per_day',
                  })
                }
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-black"
              >
                <option value="one_per_day">1 mỗi ngày</option>
                <option value="many_per_day">Nhiều mỗi ngày</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Số lượng
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={
                  row.outgoing_intro_limit_mode === 'one_per_day'
                    ? 1
                    : row.outgoing_intro_daily_limit
                }
                onChange={(e) =>
                  updateRow(row.id, {
                    outgoing_intro_daily_limit: Number(e.target.value),
                  })
                }
                disabled={row.outgoing_intro_limit_mode === 'one_per_day'}
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-black disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Xem ai thích họ
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

            <div className="flex items-end">
              <button
                onClick={() => saveRow(row)}
                disabled={savingId === row.id}
                className="w-full rounded-xl bg-pink-500 px-4 py-3 text-white hover:bg-pink-600 disabled:opacity-60"
              >
                Lưu
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}