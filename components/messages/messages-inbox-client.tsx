'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type InboxRow = {
  conversation_id: string
  other_user_id: string
  other_user_full_name: string | null
  other_user_avatar_url: string | null
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
  content: string
  created_at: string
}

import PendingIntroRequests from '@/components/messages/pending-intro-requests'

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

  async function loadInbox() {
    const { data } = await supabase.rpc('get_inbox_conversations')
    if (Array.isArray(data)) {
      setConversations(data as InboxRow[])
    }
  }

  async function loadUnreadCounts() {
    const { data } = await supabase.rpc('get_unread_conversation_counts')
    if (Array.isArray(data)) {
      const map: Record<string, number> = {}
      for (const row of data as UnreadRow[]) {
        map[row.conversation_id] = Number(row.unread_count || 0)
      }
      setUnreadMap(map)
    }
  }

  useEffect(() => {
    loadUnreadCounts()

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
  }, [])

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
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
            const displayName =
              item.other_user_full_name?.trim() || 'Người dùng chưa cập nhật tên'

            const previewText =
              item.last_message?.trim() ||
              'Hai bạn đã match! Hãy bắt đầu cuộc trò chuyện'

            const unreadCount = unreadMap[item.conversation_id] || 0

            return (
              <Link
                key={item.conversation_id}
                href={`/messages/${item.conversation_id}`}
                className="flex items-center gap-4 rounded-2xl border border-gray-200 p-4 transition hover:bg-gray-50"
              >
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-pink-100">
                  {item.other_user_avatar_url ? (
                    <img
                      src={item.other_user_avatar_url}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-pink-700">
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900">{displayName}</div>
                  <div className="truncate text-sm text-gray-500">{previewText}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="shrink-0 text-xs text-gray-400">
                    {item.last_message_at
                      ? new Date(item.last_message_at).toLocaleDateString()
                      : 'Mới'}
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