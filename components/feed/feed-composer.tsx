'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import VipBadge from '@/components/profile/vip-badge'
import type { FeedPostRow } from '@/app/(protected)/feed/page'
import { resizeImageFile } from '@/lib/image-resize'

const BUCKET = 'feed-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024

function containsBlockedContactInfo(text: string) {
  const value = text.toLowerCase()

  const hasLink =
    /https?:\/\//i.test(value) ||
    /www\./i.test(value) ||
    /\b(t\.me|telegram|zalo|facebook\.com|fb\.com|instagram\.com)\b/i.test(value)

  const hasEmail =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(value)

  const hasPhone =
    /(\+?\d[\d\s\-().]{7,}\d)/.test(value)

  return hasLink || hasEmail || hasPhone
}

export default function FeedComposer({
  currentUser,
  onCreated,
}: {
  currentUser: {
    id: string
    full_name: string | null
    avatar_url: string | null
    is_vip: boolean | null
    can_create_feed_posts: boolean | null
    daily_feed_post_limit: number | null
  } | null
  onCreated: (post: FeedPostRow) => void
}) {
  const supabase = createClient()
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState<number | null>(null)

  async function loadRemaining() {
    if (!currentUser?.id) return

    const { data } = await supabase.rpc('get_remaining_feed_posts_today', {
      p_user_id: currentUser.id,
    })

    setRemaining(Number(data || 0))
  }

  useEffect(() => {
    loadRemaining()
  }, [currentUser?.id])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]
  setError('')

  if (!file) return

  if (!file.type.startsWith('image/')) {
    setError('Vui lòng chọn ảnh hợp lệ.')
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    setError('Ảnh vượt quá 5MB.')
    return
  }

  try {
    const resizedFile = await resizeImageFile(file, {
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 0.82,
      outputType: 'image/jpeg',
    })

    setImageFile(resizedFile)
    setPreviewUrl(URL.createObjectURL(resizedFile))
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Không thể xử lý ảnh bài viết.'
    setError(message)
  }
}

  async function uploadImageIfNeeded() {
    if (!imageFile || !currentUser) {
      return { imageUrl: null as string | null, imageStoragePath: null as string | null }
    }

    const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `${currentUser.id}/feed-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: imageFile.type,
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    return {
      imageUrl: publicUrlData.publicUrl,
      imageStoragePath: filePath,
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!currentUser?.can_create_feed_posts) {
      setError('Bạn chưa có quyền đăng feed.')
      return
    }

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung bài viết.')
      return
    }

    if (containsBlockedContactInfo(content)) {
      setError('Bài viết không được chứa số điện thoại, email hoặc link.')
      return
    }

    try {
      setLoading(true)

      const { imageUrl, imageStoragePath } = await uploadImageIfNeeded()

      const { data: postId, error: createError } = await supabase.rpc('create_feed_post', {
        p_content: content.trim(),
        p_image_url: imageUrl,
        p_image_storage_path: imageStoragePath,
      })

      if (createError) {
        throw new Error(createError.message)
      }

      onCreated({
        id: postId,
        user_id: currentUser.id,
        user_full_name: currentUser.full_name,
        user_avatar_url: currentUser.avatar_url,
        user_is_vip: currentUser.is_vip ?? false,
        content: content.trim(),
        image_url: imageUrl,
        status: 'approved',
        report_count: 0,
        like_count: 0,
        comment_count: 0,
        is_hidden_by_admin: false,
        created_at: new Date().toISOString(),
      })

      setContent('')
      setImageFile(null)
      setPreviewUrl('')
      await loadRemaining()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-pink-100">
          {currentUser?.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name || 'Avatar'}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold text-gray-900">
              {currentUser?.full_name || 'Người dùng'}
            </div>
            <VipBadge isVip={currentUser?.is_vip} />
          </div>
          <div className="text-sm text-gray-500">
            {currentUser?.can_create_feed_posts
              ? `Bạn còn ${remaining ?? '-'} bài hôm nay`
              : 'Chỉ thành viên được cấp quyền mới có thể đăng feed'}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Bạn đang nghĩ gì?"
          className="min-h-28 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black outline-none"
          disabled={!currentUser?.can_create_feed_posts || loading}
        />

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={!currentUser?.can_create_feed_posts || loading}
            className="block text-sm text-black file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-pink-600"
          />
        </div>

        {previewUrl ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <img src={previewUrl} alt="Preview" className="max-h-[420px] w-full object-cover" />
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!currentUser?.can_create_feed_posts || loading}
          className="rounded-2xl bg-pink-500 px-5 py-3 font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
        >
          {loading ? 'Đang đăng...' : 'Đăng bài'}
        </button>
      </form>
    </div>
  )
}