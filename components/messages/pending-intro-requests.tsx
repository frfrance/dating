'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import VipBadge from '@/components/profile/vip-badge'

type PendingIntro = {
  request_id: string
  initiator_id: string
  initiator_full_name: string | null
  initiator_avatar_url: string | null
  initiator_is_vip?: boolean | null
  content: string
  created_at: string
}

export default function PendingIntroRequests({
  requests,
}: {
  requests: PendingIntro[]
}) {
  const supabase = createClient()
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleDecision(requestId: string, decision: 'accepted' | 'rejected') {
    try {
      setLoadingId(requestId)
      setError('')

      const { data, error } = await supabase.rpc('respond_intro_request', {
        p_request_id: requestId,
        p_decision: decision,
      })

      if (error) {
        setError(error.message)
        return
      }

      const result = Array.isArray(data) ? data[0] : null

      if (decision === 'accepted' && result?.conversation_id) {
        router.push(`/messages/${result.conversation_id}`)
        router.refresh()
        return
      }

      router.refresh()
    } catch {
      setError('Đã có lỗi xảy ra.')
    } finally {
      setLoadingId(null)
    }
  }

  if (requests.length === 0) return null

  return (
    <div className="mb-6 rounded-3xl border border-blue-200 bg-blue-50 p-5">
      <h2 className="text-lg font-semibold text-gray-900">Yêu cầu trò chuyện</h2>
      <p className="mt-1 text-sm text-gray-600">
        Người lạ chỉ được gửi một lời nhắn mở đầu. Bạn có thể đồng ý hoặc từ chối.
      </p>

      {error ? (
        <div className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {requests.map((item) => {
          const displayName =
            item.initiator_full_name?.trim() || 'Người dùng chưa cập nhật tên'

          return (
            <div
              key={item.request_id}
              className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-pink-100">
                  {item.initiator_avatar_url ? (
                    <img
                      src={item.initiator_avatar_url}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-pink-700">
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-gray-900">{displayName}</div>
                    <VipBadge isVip={item.initiator_is_vip} />
                  </div>

                  <div className="mt-1 text-sm text-gray-700">{item.content}</div>

                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDecision(item.request_id, 'rejected')}
                  disabled={loadingId === item.request_id}
                  className="rounded-2xl border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Từ chối
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision(item.request_id, 'accepted')}
                  disabled={loadingId === item.request_id}
                  className="rounded-2xl bg-pink-500 px-4 py-3 font-medium text-white hover:bg-pink-600"
                >
                  Đồng ý
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}