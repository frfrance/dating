'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DiscoverCard from './discover-card'

type Photo = {
  id: string
  image_url: string
  sort_order: number
}

export type DiscoverProfile = {
  id: string
  full_name: string | null
  birth_date: string | null
  bio: string | null
  city: string | null
  country: string | null
  avatar_url: string | null
  is_vip?: boolean | null
  photos: Photo[]
}

export default function DiscoverClient({
  initialProfiles,
}: {
  initialProfiles: DiscoverProfile[]
}) {
  const router = useRouter()
  const [profiles, setProfiles] = useState<DiscoverProfile[]>(initialProfiles)
  const [matchMessage, setMatchMessage] = useState('')

  function handleRemoved(
    profileId: string,
    matched: boolean,
    conversationId?: string | null
  ) {
    setProfiles((prev) => prev.filter((item) => item.id !== profileId))

    if (matched) {
      setMatchMessage('Đã match! Hai bạn có thể nhắn tin với nhau rồi.')

      if (conversationId) {
        setTimeout(() => {
          router.push(`/messages/${conversationId}`)
        }, 1200)
      }
    }
  }

  const currentProfile = profiles[0]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Khám phá</h1>
        <p className="mt-2 text-sm text-gray-600">
          Những người phù hợp với khu vực và tiêu chí kết nối của bạn.
        </p>
      </div>

      {matchMessage ? (
        <div className="rounded-3xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {matchMessage}
        </div>
      ) : null}

      {!currentProfile ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          Hiện chưa có hồ sơ phù hợp để khám phá.
        </div>
      ) : (
        <DiscoverCard profile={currentProfile} onRemoved={handleRemoved} />
      )}
    </div>
  )
}