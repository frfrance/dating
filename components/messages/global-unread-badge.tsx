'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function GlobalUnreadBadge({
  iconOnly = false,
}: {
  iconOnly?: boolean
}) {
  const supabase = createClient()
  const [unreadCount, setUnreadCount] = useState<number>(0)

  const loadUnreadCount = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_total_unread_messages')

    if (!error) {
      setUnreadCount(Number(data || 0))
    }
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await loadUnreadCount()
    }

    void run()

    const channel = supabase
      .channel('global-unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        async () => {
          await loadUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadUnreadCount, supabase])

  return (
    <Link
      href="/messages"
      aria-label="Tin nhắn"
      title="Tin nhắn"
      className={[
        'relative inline-flex items-center justify-center rounded-full transition hover:bg-pink-50 hover:text-pink-600',
        iconOnly
          ? 'h-11 w-11 text-gray-700'
          : 'gap-2 px-4 py-2 text-sm font-medium text-gray-700',
      ].join(' ')}
    >
      <MessageCircle className="h-5 w-5" />
      {!iconOnly ? <span>Tin nhắn</span> : null}

      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-pink-500 px-1.5 py-0.5 text-center text-xs font-semibold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  )
}