'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function IntroMessageModal({
  targetUserId,
  targetUserName,
  open,
  onClose,
}: {
  targetUserId: string
  targetUserName: string
  open: boolean
  onClose: () => void
}) {
  const supabase = createClient()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!open) return null

  async function handleSend() {
    setError('')
    setSuccess('')

    if (!content.trim()) {
      setError('Vui lòng nhập lời nhắn.')
      return
    }

    try {
      setLoading(true)

      const { data, error } = await supabase.rpc('send_intro_request', {
        p_target_user_id: targetUserId,
        p_content: content.trim(),
      })

      if (error) {
        setError(error.message)
        return
      }

      const result = Array.isArray(data) ? data[0] : null

      setSuccess(
        `Đã gửi lời nhắn làm quen. Bạn còn ${result?.remaining_today ?? 0} lượt hôm nay.`
      )
      setContent('')

      setTimeout(() => {
        onClose()
      }, 1200)
    } catch {
      setError('Đã có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900">
          Nhắn tin cho {targetUserName}
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Đây là lời nhắn làm quen đầu tiên. Nếu người ấy đồng ý, hai bạn có thể tiếp tục trò chuyện.
        </p>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          placeholder="Viết lời nhắn làm quen..."
          className="mt-4 min-h-32 w-full rounded-2xl border border-gray-300 px-4 py-3 text-black outline-none"
        />

        <div className="mt-2 text-right text-xs text-gray-400">
          {content.length}/500
        </div>

        {error ? (
          <div className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-3 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        ) : null}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 font-medium text-gray-700"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="flex-1 rounded-2xl bg-pink-500 px-4 py-3 font-medium text-white hover:bg-pink-600 disabled:opacity-60"
          >
            {loading ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </div>
  )
}