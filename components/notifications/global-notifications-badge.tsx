'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function GlobalNotificationsBadge() {
  const supabase = createClient()
  const [count, setCount] = useState(0)

  const loadCount = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_total_unread_notifications_count')
    if (!error) {
      setCount(Number(data || 0))
    }
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await loadCount()
    }

    void run()

    const messagesChannel = supabase
      .channel('global-notifications-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_notifications' },
        async () => {
          await loadCount()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feed_posts' },
        async () => {
          await loadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
    }
  }, [loadCount, supabase])

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-pink-50 hover:text-pink-600"
    >
      <Bell className="h-4 w-4" />
      <span>Thông báo</span>

      {count > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-pink-500 px-1.5 py-0.5 text-center text-xs font-semibold text-white">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  )
}