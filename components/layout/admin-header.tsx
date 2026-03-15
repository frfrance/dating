'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Users,
  FileText,
  AlertTriangle,
  BadgeCheck,
} from 'lucide-react'

const adminItems = [
  {
    href: '/admin/users',
    label: 'Người dùng',
    icon: Users,
  },
  {
    href: '/admin/feed-posts',
    label: 'Bài viết',
    icon: FileText,
  },
  {
    href: '/admin/reports',
    label: 'Báo cáo',
    icon: AlertTriangle,
  },
  {
    href: '/admin/vip-requests',
    label: 'VIP',
    icon: BadgeCheck,
  },
]

export default function AdminHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/admin/users" className="shrink-0">
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={36}
            height={36}
            className="rounded-md"
          />
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex">
          {adminItems.map((item) => {
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
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="w-9" />
      </div>

      <div className="border-t border-gray-100 bg-white lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-4 gap-2 px-2 py-2">
          {adminItems.map((item) => {
            const Icon = item.icon
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition',
                  active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100',
                ].join(' ')}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}