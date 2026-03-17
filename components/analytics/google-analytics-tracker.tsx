'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export default function GoogleAnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID
    if (!gaId || !window.gtag) return

    const query = searchParams?.toString()
    const pagePath = query ? `${pathname}?${query}` : pathname

    window.gtag('config', gaId, {
      page_path: pagePath,
    })
  }, [pathname, searchParams])

  return null
}