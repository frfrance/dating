'use client'

import { useEffect, useState } from 'react'
import {
  denyConsent,
  getSavedConsentChoice,
  grantConsent,
  saveConsentChoice,
} from '@/lib/google-consent'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = getSavedConsentChoice()

    if (saved === 'accepted') {
      grantConsent()
      setVisible(false)
      return
    }

    if (saved === 'rejected') {
      denyConsent()
      setVisible(false)
      return
    }

    setVisible(true)
  }, [])

  function handleAccept() {
    grantConsent()
    saveConsentChoice('accepted')
    setVisible(false)
  }

  function handleReject() {
    denyConsent()
    saveConsentChoice('rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl">
      <h2 className="text-lg font-semibold text-gray-900">Cookie & phân tích truy cập</h2>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        Chúng tôi sử dụng cookie và công cụ phân tích để đo lường lượt truy cập, cải thiện
        trải nghiệm và hiểu cách bạn sử dụng trang web. Bạn có thể chấp nhận hoặc từ chối.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAccept}
          className="rounded-2xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-600"
        >
          Chấp nhận
        </button>

        <button
          type="button"
          onClick={handleReject}
          className="rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Từ chối
        </button>
      </div>
    </div>
  )
}