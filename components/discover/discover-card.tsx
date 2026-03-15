'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Heart, MessageCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import IntroMessageModal from './intro-message-modal'
import VipBadge from '@/components/profile/vip-badge'

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
  passed_at?: string | null
}

function getAge(birthDate: string | null) {
  if (!birthDate) return null

  const today = new Date()
  const birth = new Date(birthDate)

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export default function DiscoverCard({
  profile,
  onRemoved,
}: {
  profile: DiscoverProfile
  onRemoved: (profileId: string, matched: boolean, conversationId?: string | null) => void
}) {
  const supabase = createClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [introOpen, setIntroOpen] = useState(false)

  const gallery = useMemo(() => {
    const extra = profile.photos?.map((p) => p.image_url) ?? []
    const all = [profile.avatar_url, ...extra].filter(Boolean) as string[]
    return all
  }, [profile])

  useEffect(() => {
    setCurrentIndex(0)
    setError('')
    setIntroOpen(false)
  }, [profile.id])

  const age = getAge(profile.birth_date)
  const displayName = profile.full_name?.trim() || 'Người dùng chưa cập nhật tên'
  const locationText = [profile.city, profile.country].filter(Boolean).join(', ')

  function goPrev() {
    setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1))
  }

  function goNext() {
    setCurrentIndex((prev) => (prev >= gallery.length - 1 ? prev : prev + 1))
  }

  async function handleSwipe(action: 'like' | 'pass') {
    try {
      setLoading(true)
      setError('')

      const { data, error } = await supabase.rpc('handle_swipe', {
        p_target_user_id: profile.id,
        p_action: action,
      })

      if (error) {
        setError(error.message)
        return
      }

      const result = Array.isArray(data) ? data[0] : null

      onRemoved(
        profile.id,
        Boolean(result?.matched),
        result?.out_conversation_id ?? result?.conversation_id ?? null
      )
    } catch {
      setError('Đã có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-xl">
        <div className="relative aspect-[4/5] bg-gray-100">
          {gallery.length > 0 ? (
            <Image
              src={gallery[currentIndex]}
              alt={displayName}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-pink-100 text-4xl font-bold text-pink-700">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
          )}

          {gallery.length > 1 ? (
            <div className="absolute left-0 right-0 top-0 flex gap-1 p-3">
              {gallery.map((_, index) => (
                <div
                  key={index}
                  className={[
                    'h-1 flex-1 rounded-full',
                    index === currentIndex ? 'bg-white' : 'bg-white/40',
                  ].join(' ')}
                />
              ))}
            </div>
          ) : null}

          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-0 top-0 h-full w-1/2"
                aria-label="Ảnh trước"
              />

              <button
                type="button"
                onClick={goNext}
                className="absolute right-0 top-0 h-full w-1/2"
                aria-label="Ảnh tiếp theo"
              />
            </>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold">
                {displayName}
                {age ? `, ${age}` : ''}
              </h2>
              <VipBadge isVip={profile.is_vip} className="bg-white/90 text-pink-700" />
            </div>

            {locationText ? (
              <p className="mt-1 text-sm text-white/90">{locationText}</p>
            ) : null}

            <p className="mt-2 line-clamp-3 text-sm text-white/90">
              {profile.bio || 'Chưa có mô tả.'}
            </p>
          </div>
        </div>

        <div className="p-4">
          {error ? (
            <div className="mb-3 rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSwipe('pass')}
              className="flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <X className="h-5 w-5" />
            </button>

            <Link
              href={`/people/${profile.id}`}
              className="flex items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-black"
            >
              Xem thêm
            </Link>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSwipe('like')}
              className="flex items-center justify-center rounded-2xl bg-pink-500 px-4 py-3 text-white hover:bg-pink-600 disabled:opacity-60"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIntroOpen(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 font-medium text-pink-700 hover:bg-pink-100"
          >
            <MessageCircle className="h-4 w-4" />
            Nhắn tin hỏi thêm
          </button>
        </div>
      </div>

      <IntroMessageModal
        targetUserId={profile.id}
        targetUserName={displayName}
        open={introOpen}
        onClose={() => setIntroOpen(false)}
      />
    </>
  )
}