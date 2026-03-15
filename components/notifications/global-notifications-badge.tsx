'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function GlobalNotificationsBadge({
  iconOnly = false,
}: {
  iconOnly?: boolean
}) {
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

    const channel = supabase
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
      supabase.removeChannel(channel)
    }
  }, [loadCount, supabase])

  return (
    <Link
      href="/notifications"
      aria-label="Thông báo"
      title="Thông báo"
      className={[
        'relative inline-flex items-center justify-center rounded-full transition hover:bg-pink-50 hover:text-pink-600',
        iconOnly
          ? 'h-11 w-11 text-gray-700'
          : 'gap-2 px-4 py-2 text-sm font-medium text-gray-700',
      ].join(' ')}
    >
      <Bell className="h-5 w-5" />
      {!iconOnly ? <span>Thông báo</span> : null}

      {count > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-pink-500 px-1.5 py-0.5 text-center text-xs font-semibold text-white">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  )
}