'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Compass,
  HeartHandshake,
  PencilLine,
  UserCircle2,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import GlobalUnreadBadge from '@/components/messages/global-unread-badge'

const navItems = [
  { href: '/discover', label: 'Khám phá', icon: Compass },
  { href: '/connect', label: 'Kết nối', icon: HeartHandshake },
  { href: '/profile', label: 'Hồ sơ', icon: UserCircle2 },
]

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/discover" className="flex items-center">
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={36}
            height={36}
            className="rounded-md"
          />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-pink-100 text-pink-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          <GlobalUnreadBadge />
        </nav>

        <button
          onClick={handleLogout}
          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Đăng xuất
        </button>
      </div>

      <nav className="mx-auto flex max-w-6xl items-center justify-around border-t border-gray-200 px-2 py-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs',
                active ? 'text-pink-600' : 'text-gray-500',
              ].join(' ')}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        <Link
          href="/messages"
          className={[
            'flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs',
            pathname.startsWith('/messages') ? 'text-pink-600' : 'text-gray-500',
          ].join(' ')}
        >
          <div className="relative">
            <MessageCircleShim />
            <MobileUnreadBubble />
          </div>
          <span>Tin nhắn</span>
        </Link>
      </nav>
    </header>
  )
}

function MessageCircleShim() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function MobileUnreadBubble() {
  const supabase = createClient()
  const [count, setCount] = useState(0)

  async function loadUnreadCount() {
    const { data, error } = await supabase.rpc('get_total_unread_messages')
    if (!error) setCount(Number(data || 0))
  }

  useEffect(() => {
    loadUnreadCount()

    const channel = supabase
      .channel('mobile-global-unread-messages')
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
  }, [])

  if (count <= 0) return null

  return (
    <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-pink-500 px-1.5 py-0.5 text-center text-[10px] font-semibold text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}