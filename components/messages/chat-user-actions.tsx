'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ChatUserActions({
  otherUserId,
  otherUserName,
  otherUserAvatarUrl,
}: {
  otherUserId: string
  otherUserName: string
  otherUserAvatarUrl: string | null
}) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reason, setReason] = useState('Quấy rối / làm phiền')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function handleBlockUser() {
    const confirmed = window.confirm(
      `Bạn có chắc muốn chặn ${otherUserName}? Sau khi chặn, hai người sẽ không còn thấy nhau trong nhắn tin, khám phá và kết nối.`
    )

    if (!confirmed) return

    try {
      setLoading(true)
      setMessage('')

      const { error } = await supabase.rpc('block_user', {
        p_target_user_id: otherUserId,
      })

      if (error) {
        setMessage(error.message)
        return
      }

      router.push('/messages')
      router.refresh()
    } catch {
      setMessage('Không thể chặn người dùng này.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReportUser() {
    try {
      setLoading(true)
      setMessage('')

      const { error } = await supabase.rpc('report_user', {
        p_target_user_id: otherUserId,
        p_reason: reason,
        p_details: details,
      })

      if (error) {
        setMessage(error.message)
        return
      }

      setMessage('Đã gửi báo cáo.')
      setDetails('')
      setTimeout(() => {
        setReportOpen(false)
        setOpen(false)
      }, 900)
    } catch {
      setMessage('Không thể gửi báo cáo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="relative" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-pink-100"
        >
          {otherUserAvatarUrl ? (
            <img
              src={otherUserAvatarUrl}
              alt={otherUserName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-pink-700">
              {otherUserName.slice(0, 1).toUpperCase()}
            </span>
          )}
        </button>

        {open ? (
          <div className="absolute left-0 top-14 z-50 w-56 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
            <Link
              href={`/people/${otherUserId}`}
              className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Xem profile
            </Link>

            <button
              type="button"
              onClick={() => {
                setReportOpen(true)
                setOpen(false)
              }}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Báo cáo người dùng này
            </button>

            <button
              type="button"
              onClick={handleBlockUser}
              disabled={loading}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Chặn người dùng này
            </button>
          </div>
        ) : null}
      </div>

      {reportOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900">
              Báo cáo {otherUserName}
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Lý do
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-black outline-none"
                >
                  <option>Quấy rối / làm phiền</option>
                  <option>Spam</option>
                  <option>Giả mạo</option>
                  <option>Nội dung không phù hợp</option>
                  <option>Lý do khác</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mô tả thêm
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black outline-none"
                  placeholder="Mô tả thêm nếu cần..."
                />
              </div>

              {message ? (
                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {message}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="rounded-2xl border border-gray-300 px-4 py-3 font-medium text-gray-700"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleReportUser}
                  disabled={loading}
                  className="rounded-2xl bg-pink-500 px-4 py-3 font-medium text-white hover:bg-pink-600 disabled:opacity-60"
                >
                  {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}