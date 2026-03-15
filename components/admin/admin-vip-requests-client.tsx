'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, CheckCircle2, XCircle, Crown, User } from 'lucide-react'
import type {
  VipRequestRow,
  VipUserRow,
} from '@/app/(protected)/admin/vip-requests/page'
import { formatGermanDateTime } from '@/lib/date-format'

function buildPageHref(vipPage: number, nonVipPage: number) {
  const params = new URLSearchParams()
  params.set('vipPage', String(vipPage))
  params.set('nonVipPage', String(nonVipPage))
  return `/admin/vip-requests?${params.toString()}`
}

export default function AdminVipRequestsClient({
  initialPendingRequests,
  initialVipUsers,
  initialNonVipUsers,
  currentVipPage,
  totalVipPages,
  totalVipUsers,
  currentNonVipPage,
  totalNonVipPages,
  totalNonVipUsers,
  pageSize,
}: {
  initialPendingRequests: VipRequestRow[]
  initialVipUsers: VipUserRow[]
  initialNonVipUsers: VipUserRow[]
  currentVipPage: number
  totalVipPages: number
  totalVipUsers: number
  currentNonVipPage: number
  totalNonVipPages: number
  totalNonVipUsers: number
  pageSize: number
}) {
  const supabase = createClient()

  const [pendingRequests, setPendingRequests] = useState(initialPendingRequests)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [searchVip, setSearchVip] = useState('')
  const [searchNonVip, setSearchNonVip] = useState('')

  useEffect(() => {
    setPendingRequests(initialPendingRequests)
  }, [initialPendingRequests])

  const vipUsers = initialVipUsers
  const nonVipUsers = initialNonVipUsers

  async function handleApprove(requestId: string) {
    try {
      setLoadingId(requestId)
      setError('')
      setMessage('')

      const { error } = await supabase.rpc('approve_vip_request_admin', {
        p_request_id: requestId,
      })

      if (error) {
        setError(error.message)
        return
      }

      setPendingRequests((prev) => prev.filter((item) => item.id !== requestId))
      setMessage('Đã duyệt yêu cầu VIP.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleReject(requestId: string) {
    try {
      setLoadingId(requestId)
      setError('')
      setMessage('')

      const { error } = await supabase.rpc('reject_vip_request_admin', {
        p_request_id: requestId,
      })

      if (error) {
        setError(error.message)
        return
      }

      setPendingRequests((prev) => prev.filter((item) => item.id !== requestId))
      setMessage('Đã từ chối yêu cầu VIP.')
    } finally {
      setLoadingId(null)
    }
  }

  const filteredVipUsers = useMemo(() => {
    const keyword = searchVip.trim().toLowerCase()
    if (!keyword) return vipUsers

    return vipUsers.filter((item) => {
      const name = (item.full_name || '').toLowerCase()
      const email = (item.email || '').toLowerCase()
      return name.includes(keyword) || email.includes(keyword)
    })
  }, [vipUsers, searchVip])

  const filteredNonVipUsers = useMemo(() => {
    const keyword = searchNonVip.trim().toLowerCase()
    if (!keyword) return nonVipUsers

    return nonVipUsers.filter((item) => {
      const name = (item.full_name || '').toLowerCase()
      const email = (item.email || '').toLowerCase()
      return name.includes(keyword) || email.includes(keyword)
    })
  }, [nonVipUsers, searchNonVip])

  const vipVisibleFrom = totalVipUsers === 0 ? 0 : (currentVipPage - 1) * pageSize + 1
  const vipVisibleTo = Math.min(currentVipPage * pageSize, totalVipUsers)

  const nonVipVisibleFrom =
    totalNonVipUsers === 0 ? 0 : (currentNonVipPage - 1) * pageSize + 1
  const nonVipVisibleTo = Math.min(currentNonVipPage * pageSize, totalNonVipUsers)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đăng ký VIP</h1>
        <p className="mt-2 text-sm text-gray-600">
          Duyệt yêu cầu VIP và theo dõi danh sách người dùng VIP / không VIP.
        </p>
      </div>

      {message ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Crown className="h-5 w-5 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-900">Yêu cầu chờ duyệt</h2>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
            Hiện không có yêu cầu VIP nào đang chờ duyệt.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((item) => {
              const displayName = item.profile_full_name || 'Người dùng'
              const displayEmail = item.profile_email || 'Không có email'

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-full bg-pink-100">
                          {item.profile_avatar_url ? (
                            <img
                              src={item.profile_avatar_url}
                              alt={displayName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-pink-700">
                              {displayName.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900">{displayName}</div>
                          <div className="text-sm text-gray-500">{displayEmail}</div>
                          <div className="mt-1 text-xs text-gray-400">
                            Gửi lúc {formatGermanDateTime(item.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-gray-50 p-4">
                          <div className="text-sm font-medium text-gray-500">Số điện thoại</div>
                          <div className="mt-1 text-gray-900">
                            {item.phone_number || 'Chưa cung cấp'}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                          <div className="text-sm font-medium text-gray-500">Facebook</div>
                          <div className="mt-1 break-all text-gray-900">
                            {item.facebook_link ? (
                              <a
                                href={item.facebook_link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-pink-600 hover:underline"
                              >
                                {item.facebook_link}
                              </a>
                            ) : (
                              'Chưa cung cấp'
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          disabled={loadingId === item.id}
                          className="inline-flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 font-medium text-white hover:bg-pink-600 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {loadingId === item.id ? 'Đang xử lý...' : 'Duyệt'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(item.id)}
                          disabled={loadingId === item.id}
                          className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </button>

                        <Link
                          href={`/people/${item.user_id}`}
                          className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <User className="h-4 w-4" />
                          Xem hồ sơ
                        </Link>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-3 text-sm font-semibold text-gray-700">
                        Ảnh chụp mặt chính diện
                      </div>

                      {item.face_image_url ? (
                        <img
                          src={item.face_image_url}
                          alt="Ảnh xác minh VIP"
                          className="w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
                          Chưa có ảnh
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-yellow-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900">Danh sách VIP</h2>
        </div>

        <div className="mb-2 text-sm text-gray-500">
          Đang xem {vipVisibleFrom} - {vipVisibleTo} trên tổng {totalVipUsers} người · Trang{' '}
          {currentVipPage}/{totalVipPages}
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchVip}
            onChange={(e) => setSearchVip(e.target.value)}
            placeholder="Tìm trong trang VIP hiện tại..."
            className="h-12 w-full bg-transparent text-black outline-none placeholder:text-gray-400"
          />
        </div>

        {filteredVipUsers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
            Không có người dùng VIP phù hợp.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredVipUsers.map((item) => {
              const displayName = item.full_name || 'Người dùng'

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-yellow-100">
                      {item.avatar_url ? (
                        <img
                          src={item.avatar_url}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-yellow-700">
                          {displayName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">{displayName}</div>
                      <div className="truncate text-sm text-gray-500">
                        {item.email || 'Không có email'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/people/${item.id}`}
                      className="inline-flex items-center justify-center rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Xem hồ sơ
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          {currentVipPage > 1 ? (
            <Link
              href={buildPageHref(currentVipPage - 1, currentNonVipPage)}
              className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Trang VIP trước
            </Link>
          ) : (
            <span className="rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-400">
              ← Trang VIP trước
            </span>
          )}

          {currentVipPage < totalVipPages ? (
            <Link
              href={buildPageHref(currentVipPage + 1, currentNonVipPage)}
              className="rounded-2xl bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
            >
              Trang VIP sau →
            </Link>
          ) : (
            <span className="rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-400">
              Trang VIP sau →
            </span>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900">Danh sách không VIP</h2>
        </div>

        <div className="mb-2 text-sm text-gray-500">
          Đang xem {nonVipVisibleFrom} - {nonVipVisibleTo} trên tổng {totalNonVipUsers} người ·
          Trang {currentNonVipPage}/{totalNonVipPages}
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchNonVip}
            onChange={(e) => setSearchNonVip(e.target.value)}
            placeholder="Tìm trong trang không VIP hiện tại..."
            className="h-12 w-full bg-transparent text-black outline-none placeholder:text-gray-400"
          />
        </div>

        {filteredNonVipUsers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
            Không có người dùng không VIP phù hợp.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredNonVipUsers.map((item) => {
              const displayName = item.full_name || 'Người dùng'

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                      {item.avatar_url ? (
                        <img
                          src={item.avatar_url}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-700">
                          {displayName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900">{displayName}</div>
                      <div className="truncate text-sm text-gray-500">
                        {item.email || 'Không có email'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/people/${item.id}`}
                      className="inline-flex items-center justify-center rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Xem hồ sơ
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          {currentNonVipPage > 1 ? (
            <Link
              href={buildPageHref(currentVipPage, currentNonVipPage - 1)}
              className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Trang không VIP trước
            </Link>
          ) : (
            <span className="rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-400">
              ← Trang không VIP trước
            </span>
          )}

          {currentNonVipPage < totalNonVipPages ? (
            <Link
              href={buildPageHref(currentVipPage, currentNonVipPage + 1)}
              className="rounded-2xl bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
            >
              Trang không VIP sau →
            </Link>
          ) : (
            <span className="rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-400">
              Trang không VIP sau →
            </span>
          )}
        </div>
      </section>
    </div>
  )
}