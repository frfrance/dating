'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { Bell, Heart, MessageCircle, Newspaper } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import VipBadge from '@/components/profile/vip-badge'
import { formatGermanDateTime } from '@/lib/date-format'
import type {
  NotificationRow,
  UnseenFeedPostRow,
} from '@/app/(protected)/notifications/page'

export default function NotificationsClient({
  initialNotifications,
  initialFeedNotifications,
}: {
  initialNotifications: NotificationRow[]
  initialFeedNotifications: UnseenFeedPostRow[]
}) {
  const supabase = createClient()

  useEffect(() => {
    const run = async () => {
      await supabase.rpc('mark_all_notifications_seen')
    }

    void run()
  }, [supabase])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
        <p className="mt-2 text-sm text-gray-600">
          Like, comment và các bài feed mới sẽ hiện tại đây.
        </p>
      </div>

      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Bài viết feed mới</h2>
        </div>

        {initialFeedNotifications.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
            Hiện chưa có bài feed mới.
          </div>
        ) : (
          <div className="space-y-3">
            {initialFeedNotifications.map((item) => {
              const displayName = item.user_full_name || 'Người dùng'
              return (
                <Link
                  key={item.id}
                  href="/feed"
                  className="flex items-start gap-3 rounded-2xl border border-gray-200 p-4 transition hover:bg-gray-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-blue-100">
                    {item.user_avatar_url ? (
                      <Image
                        src={item.user_avatar_url}
                        alt={displayName}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-sm font-semibold text-blue-700">
                        {displayName.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold text-gray-900">{displayName}</div>
                      <VipBadge isVip={item.user_is_vip} />
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      vừa đăng một bài viết mới trên feed.
                    </div>
                    {item.content ? (
                      <div className="mt-2 line-clamp-2 text-sm text-gray-500">
                        {item.content}
                      </div>
                    ) : null}
                    <div className="mt-2 text-xs text-gray-400">
                      {formatGermanDateTime(item.created_at)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-pink-500" />
          <h2 className="text-xl font-semibold text-gray-900">Hoạt động trên bài viết của bạn</h2>
        </div>

        {initialNotifications.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
            Chưa có thông báo nào.
          </div>
        ) : (
          <div className="space-y-3">
            {initialNotifications.map((item) => {
              const displayName = item.actor_full_name || 'Người dùng'
              const icon =
                item.type === 'feed_like' ? (
                  <Heart className="h-4 w-4 text-pink-500" />
                ) : (
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                )

              return (
                <Link
                  key={item.id}
                  href={item.href || '/feed'}
                  className="flex items-start gap-3 rounded-2xl border border-gray-200 p-4 transition hover:bg-gray-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-pink-100">
                    {item.actor_avatar_url ? (
                      <Image
                        src={item.actor_avatar_url}
                        alt={displayName}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-sm font-semibold text-pink-700">
                        {displayName.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {icon}
                      <div className="font-semibold text-gray-900">{displayName}</div>
                      <VipBadge isVip={item.actor_is_vip} />
                    </div>
                    <div className="mt-1 text-sm text-gray-700">{item.body || item.title}</div>
                    <div className="mt-2 text-xs text-gray-400">
                      {formatGermanDateTime(item.created_at)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}