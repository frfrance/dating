'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import VipBadge from '@/components/profile/vip-badge'
import PendingIntroRequests from '@/components/messages/pending-intro-requests'
import { formatGermanDate } from '@/lib/date-format'

type InboxRow = {
  conversation_id: string
  other_user_id: string
  other_user_full_name: string | null
  other_user_avatar_url: string | null
  other_user_is_vip?: boolean | null
  last_message: string | null
  last_message_at: string | null
}

type UnreadRow = {
  conversation_id: string
  unread_count: number
}

type PendingIntro = {
  request_id: string
  initiator_id: string
  initiator_full_name: string | null
  initiator_avatar_url: string | null
  initiator_is_vip?: boolean | null
  content: string
  created_at: string
}

const ADMIN_SUPPORT_USER_ID = '4db1ed64-15a7-4643-b6d6-8b1b0ec67425'

export default function MessagesInboxClient({
  initialConversations,
  initialPendingRequests,
}: {
  initialConversations: InboxRow[]
  initialPendingRequests: PendingIntro[]
}) {
  const supabase = createClient()

  const [conversations, setConversations] = useState(initialConversations)
  const [pendingRequests] = useState(initialPendingRequests)
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({})

  const loadInbox = useCallback(async () => {
    const { data } = await supabase.rpc('get_inbox_conversations')
    if (Array.isArray(data)) {
      setConversations(data as InboxRow[])
    }
  }, [supabase])

  const loadUnreadCounts = useCallback(async () => {
    const { data } = await supabase.rpc('get_unread_conversation_counts')
    if (Array.isArray(data)) {
      const map: Record<string, number> = {}
      for (const row of data as UnreadRow[]) {
        map[row.conversation_id] = Number(row.unread_count || 0)
      }
      setUnreadMap(map)
    }
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await loadUnreadCounts()
    }

    void run()

    const channel = supabase
      .channel('messages-inbox-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        async () => {
          await loadInbox()
          await loadUnreadCounts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadInbox, loadUnreadCounts, supabase])

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aIsSupport = a.other_user_id === ADMIN_SUPPORT_USER_ID
      const bIsSupport = b.other_user_id === ADMIN_SUPPORT_USER_ID

      if (aIsSupport && !bIsSupport) return -1
      if (!aIsSupport && bIsSupport) return 1

      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
      return bTime - aTime
    })
  }, [conversations])

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>

      <div className="mt-6">
        <PendingIntroRequests requests={pendingRequests} />
      </div>

      {sortedConversations.length === 0 ? (
        <p className="mt-4 text-gray-600">Bạn chưa có cuộc trò chuyện nào.</p>
      ) : (
        <div className="space-y-3">
          {sortedConversations.map((item) => {
            const isSupportConversation = item.other_user_id === ADMIN_SUPPORT_USER_ID

            const displayName = isSupportConversation
              ? 'ASSMIN'
              : item.other_user_full_name?.trim() || 'Người dùng chưa cập nhật tên'

            const previewText =
              item.last_message?.trim() ||
              (isSupportConversation
                ? 'Nhấn vào đây nếu bạn cần hỗ trợ'
                : 'Hai bạn đã match! Hãy bắt đầu cuộc trò chuyện')

            const unreadCount = unreadMap[item.conversation_id] || 0

            return (
              <Link
                key={item.conversation_id}
                href={`/messages/${item.conversation_id}`}
                className={[
                  'flex items-center gap-4 rounded-2xl border p-4 transition hover:bg-gray-50',
                  isSupportConversation
                    ? 'border-pink-200 bg-pink-50'
                    : 'border-gray-200',
                ].join(' ')}
              >
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-pink-100">
                  {item.other_user_avatar_url ? (
                    <Image
                      src={item.other_user_avatar_url}
                      alt={displayName}
                      width={56}
                      height={56}
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
                    <div className="font-semibold text-gray-900">{displayName}</div>
                    {isSupportConversation ? (
                      <span className="rounded-full bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-700">
                        Hỗ trợ
                      </span>
                    ) : (
                      <VipBadge isVip={item.other_user_is_vip} />
                    )}
                  </div>
                  <div className="truncate text-sm text-gray-500">{previewText}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div suppressHydrationWarning className="shrink-0 text-xs text-gray-400">
                    {item.last_message_at ? formatGermanDate(item.last_message_at) : 'Mới'}
                  </div>

                  {unreadCount > 0 ? (
                    <span className="min-w-6 rounded-full bg-pink-500 px-2 py-1 text-center text-xs font-semibold text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  ) : null}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}