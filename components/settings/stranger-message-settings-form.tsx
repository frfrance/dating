'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ProfileSettings = {
  id: string
  allow_intro_messages: boolean
  incoming_intro_limit_mode: 'one_per_day' | 'many_per_day'
  incoming_intro_daily_limit: number
}

export default function StrangerMessageSettingsForm({
  profile,
}: {
  profile: ProfileSettings
}) {
  const supabase = createClient()

  const [allowIntroMessages, setAllowIntroMessages] = useState(
    profile.allow_intro_messages
  )
  const [limitMode, setLimitMode] = useState<'one_per_day' | 'many_per_day'>(
    profile.incoming_intro_limit_mode
  )
  const [dailyLimit, setDailyLimit] = useState(profile.incoming_intro_daily_limit || 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const finalLimit = limitMode === 'one_per_day' ? 1 : Math.max(1, dailyLimit)

    try {
      setLoading(true)

      const { error } = await supabase
        .from('profiles')
        .update({
          allow_intro_messages: allowIntroMessages,
          incoming_intro_limit_mode: limitMode,
          incoming_intro_daily_limit: finalLimit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Đã lưu giới hạn người gửi cho bạn mỗi ngày.')
    } catch {
      setError('Đã có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-bold text-gray-900">
        Giới hạn người gửi cho bạn mỗi ngày
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Bạn có thể quyết định có nhận lời nhắn từ người lạ hay không, và tối đa
        bao nhiêu người lạ được phép gửi lời nhắn mở đầu cho bạn mỗi ngày.
      </p>

      <div className="mt-6 space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <label className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-gray-900">
                Cho phép người lạ gửi lời nhắn làm quen
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Nếu tắt, người chưa match sẽ không thể gửi lời nhắn mở đầu cho bạn.
              </div>
            </div>

            <input
              type="checkbox"
              checked={allowIntroMessages}
              onChange={(e) => setAllowIntroMessages(e.target.checked)}
              className="h-5 w-5 accent-pink-500"
            />
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Giới hạn người lạ được gửi cho bạn mỗi ngày
          </label>

          <select
            value={limitMode}
            onChange={(e) => setLimitMode(e.target.value as 'one_per_day' | 'many_per_day')}
            className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-black outline-none"
          >
            <option value="one_per_day">Chỉ 1 người mỗi ngày</option>
            <option value="many_per_day">Nhiều người mỗi ngày</option>
          </select>
        </div>

        {limitMode === 'many_per_day' ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Số người tối đa mỗi ngày
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-black outline-none"
            />
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-pink-500 px-5 py-3 font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
        >
          {loading ? 'Đang lưu...' : 'Lưu giới hạn'}
        </button>
      </div>
    </form>
  )
}