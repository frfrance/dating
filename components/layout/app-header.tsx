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
import GlobalNotificationsBadge from '@/components/notifications/global-notifications-badge'

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

  const isMessagesActive =
    pathname === '/messages' || pathname.startsWith('/messages/')

  const isNotificationsActive =
    pathname === '/notifications' || pathname.startsWith('/notifications/')

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
                aria-label={item.label}
                title={item.label}
                className={[
                  'inline-flex h-11 w-11 items-center justify-center rounded-full transition',
                  active
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600',
                ].join(' ')}
              >
                <Icon className="h-5 w-5" />
              </Link>
            )
          })}

          <div
            className={[
              'rounded-full transition',
              isNotificationsActive ? 'bg-pink-500 text-white shadow-sm' : '',
            ].join(' ')}
          >
            <GlobalNotificationsBadge iconOnly />
          </div>

          <div
            className={[
              'rounded-full transition',
              isMessagesActive ? 'bg-pink-500 text-white shadow-sm' : '',
            ].join(' ')}
          >
            <GlobalUnreadBadge iconOnly />
          </div>
        </nav>

        <div className="w-9" />
      </div>

      <div className="border-t border-pink-50 bg-white md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-6 px-2 py-2">
          <Link
            href="/feed"
            aria-label="Feed"
            title="Feed"
            className={[
              'flex items-center justify-center rounded-2xl px-2 py-3 transition',
              pathname === '/feed' || pathname.startsWith('/feed/')
                ? 'bg-pink-50 text-pink-600'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600',
            ].join(' ')}
          >
            <Newspaper className="h-5 w-5" />
          </Link>

          <Link
            href="/discover"
            aria-label="Khám phá"
            title="Khám phá"
            className={[
              'flex items-center justify-center rounded-2xl px-2 py-3 transition',
              pathname === '/discover' || pathname.startsWith('/discover/')
                ? 'bg-pink-50 text-pink-600'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600',
            ].join(' ')}
          >
            <Compass className="h-5 w-5" />
          </Link>

          <Link
            href="/connect"
            aria-label="Kết nối"
            title="Kết nối"
            className={[
              'flex items-center justify-center rounded-2xl px-2 py-3 transition',
              pathname === '/connect' || pathname.startsWith('/connect/')
                ? 'bg-pink-50 text-pink-600'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600',
            ].join(' ')}
          >
            <HeartHandshake className="h-5 w-5" />
          </Link>

          <div
            className={[
              'flex items-center justify-center rounded-2xl transition',
              isNotificationsActive ? 'bg-pink-50 text-pink-600' : '',
            ].join(' ')}
          >
            <GlobalNotificationsBadge iconOnly />
          </div>

          <div
            className={[
              'flex items-center justify-center rounded-2xl transition',
              isMessagesActive ? 'bg-pink-50 text-pink-600' : '',
            ].join(' ')}
          >
            <GlobalUnreadBadge iconOnly />
          </div>

          <Link
            href="/profile"
            aria-label="Hồ sơ"
            title="Hồ sơ"
            className={[
              'flex items-center justify-center rounded-2xl px-2 py-3 transition',
              pathname === '/profile' || pathname.startsWith('/profile/')
                ? 'bg-pink-50 text-pink-600'
                : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600',
            ].join(' ')}
          >
            <UserRound className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}