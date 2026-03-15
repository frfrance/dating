'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Newspaper,
  Compass,
  HeartHandshake,
  UserRound,
} from 'lucide-react'
import GlobalUnreadBadge from '@/components/messages/global-unread-badge'

const navItems = [
  {
    href: '/feed',
    label: 'Feed',
    icon: Newspaper,
  },
  {
    href: '/discover',
    label: 'Khám phá',
    icon: Compass,
  },
  {
    href: '/connect',
    label: 'Kết nối',
    icon: HeartHandshake,
  },
  {
    href: '/profile',
    label: 'Hồ sơ',
    icon: UserRound,
  },
]

export default function AppHeader() {
  const pathname = usePathname()
  const isMessagesActive = pathname === '/messages' || pathname.startsWith('/messages/')

  return (
    <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/discover" className="shrink-0">
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={36}
            height={36}
            className="rounded-md"
          />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          <div
            className={[
              'rounded-full transition',
              isMessagesActive ? 'bg-pink-500 text-white shadow-sm' : '',
            ].join(' ')}
          >
            <GlobalUnreadBadge />
          </div>
        </nav>

        <div className="w-9" />
      </div>

      <div className="border-t border-pink-50 bg-white md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-5 px-2 py-2">
          <Link
            href="/feed"
            className={[
              'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition',
              pathname === '/feed' || pathname.startsWith('/feed/')
                ? 'bg-pink-50 text-pink-600'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600',
            ].join(' ')}
          >
            <Newspaper className="h-4 w-4" />
            <span>Feed</span>
          </Link>

          <Link
            href="/discover"
            className={[
              'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition',
              pathname === '/discover' || pathname.startsWith('/discover/')
                ? 'bg-pink-50 text-pink-600'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600',
            ].join(' ')}
          >
            <Compass className="h-4 w-4" />
            <span>Khám phá</span>
          </Link>

          <Link
            href="/connect"
            className={[
              'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition',
              pathname === '/connect' || pathname.startsWith('/connect/')
                ? 'bg-pink-50 text-pink-600'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600',
            ].join(' ')}
          >
            <HeartHandshake className="h-4 w-4" />
            <span>Kết nối</span>
          </Link>

          <div className="flex items-center justify-center">
            <GlobalUnreadBadge />
          </div>

          <Link
            href="/profile"
            className={[
              'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition',
              pathname === '/profile' || pathname.startsWith('/profile/')
                ? 'bg-pink-50 text-pink-600'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600',
            ].join(' ')}
          >
            <UserRound className="h-4 w-4" />
            <span>Hồ sơ</span>
          </Link>
        </div>
      </div>
    </header>
  )
}