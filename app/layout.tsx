import type { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import GoogleAnalyticsTracker from '@/components/analytics/google-analytics-tracker'
import CookieConsentBanner from '@/components/analytics/cookie-consent-banner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Hẹn Hò Tại Châu Âu',
  description: 'Nền tảng kết nối người Việt tại châu Âu',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <html lang="vi">
      <head>
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-consent-default" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;

                gtag('js', new Date());

                gtag('consent', 'default', {
                  analytics_storage: 'denied',
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied'
                });

                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {gaId ? (
          <Suspense fallback={null}>
            <GoogleAnalyticsTracker />
          </Suspense>
        ) : null}

        {children}

        {gaId ? <CookieConsentBanner /> : null}
      </body>
    </html>
  )
}