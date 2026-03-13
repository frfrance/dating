'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DiscoverCard from '@/components/discover/discover-card'

type Photo = {
  id: string
  image_url: string
  sort_order: number
}

type LikesYouProfile = {
  id: string
  full_name: string
  birth_date: string | null
  bio: string | null
  city: string | null
  country: string | null
  avatar_url: string | null
  liked_at: string
  photos: Photo[]
}

export default function LikesYouClient({
  initialProfiles,
}: {
  initialProfiles: LikesYouProfile[]
}) {
  const router = useRouter()
  const [profiles, setProfiles] = useState(initialProfiles)
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
        <h1 className="text-3xl font-bold text-gray-900">Ai đã thích bạn</h1>
        <p className="mt-2 text-sm text-gray-600">
          Những người đã thích bạn và đang chờ bạn phản hồi.
        </p>
      </div>

      {matchMessage ? (
        <div className="rounded-3xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {matchMessage}
        </div>
      ) : null}

      {!currentProfile ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          Hiện không còn ai đang chờ bạn phản hồi.
        </div>
      ) : (
        <DiscoverCard profile={currentProfile} onRemoved={handleRemoved} />
      )}
    </div>
  )
}