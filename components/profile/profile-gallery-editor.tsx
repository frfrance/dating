'use client'

import { useMemo, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type PhotoItem = {
  id: string
  image_url: string
  storage_path: string
  sort_order: number
}

type ProfileGalleryEditorProps = {
  userId: string
  initialPhotos: PhotoItem[]
}

const GALLERY_BUCKET = 'profile-photos'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_PHOTOS = 5

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

export default function ProfileGalleryEditor({
  userId,
  initialPhotos,
}: ProfileGalleryEditorProps) {
  const supabase = createClient()

  const [photos, setPhotos] = useState<PhotoItem[]>(
    [...initialPhotos].sort((a, b) => a.sort_order - b.sort_order)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const remainingSlots = useMemo(() => MAX_PHOTOS - photos.length, [photos.length])

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setError('')
    setSuccess('')

    if (files.length === 0) return

    if (photos.length >= MAX_PHOTOS) {
      setError(`Bạn chỉ có thể tải tối đa ${MAX_PHOTOS} ảnh phụ.`)
      return
    }

    if (files.length > remainingSlots) {
      setError(`Bạn chỉ còn có thể thêm ${remainingSlots} ảnh.`)
      return
    }

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError('Có ảnh không hợp lệ. Hãy chọn JPG, PNG, WEBP, HEIC hoặc HEIF.')
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('Có ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.')
        return
      }
    }

    try {
      setLoading(true)

      const uploadedItems: PhotoItem[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const filePath = `${userId}/photo-${Date.now()}-${i}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from(GALLERY_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type,
          })

        if (uploadError) {
          throw new Error(`Upload ảnh phụ thất bại: ${uploadError.message}`)
        }

        const { data: publicUrlData } = supabase.storage
          .from(GALLERY_BUCKET)
          .getPublicUrl(filePath)

        const nextSortOrder = photos.length + uploadedItems.length

        const { data: insertedPhoto, error: insertError } = await supabase
          .from('profile_photos')
          .insert({
            user_id: userId,
            image_url: publicUrlData.publicUrl,
            storage_path: filePath,
            sort_order: nextSortOrder,
          })
          .select('id, image_url, storage_path, sort_order')
          .single()

        if (insertError) {
          throw new Error(`Lưu ảnh phụ thất bại: ${insertError.message}`)
        }

        uploadedItems.push(insertedPhoto)
      }

      setPhotos((prev) => [...prev, ...uploadedItems].sort((a, b) => a.sort_order - b.sort_order))
      setSuccess('Đã tải ảnh phụ thành công.')
      e.target.value = ''
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeletePhoto(photo: PhotoItem) {
    setError('')
    setSuccess('')

    try {
      setLoading(true)

      const { error: storageError } = await supabase.storage
        .from(GALLERY_BUCKET)
        .remove([photo.storage_path])

      if (storageError) {
        throw new Error(`Xóa file ảnh thất bại: ${storageError.message}`)
      }

      const { error: dbError } = await supabase
        .from('profile_photos')
        .delete()
        .eq('id', photo.id)
        .eq('user_id', userId)

      if (dbError) {
        throw new Error(`Xóa bản ghi ảnh thất bại: ${dbError.message}`)
      }

      const nextPhotos = photos
        .filter((item) => item.id !== photo.id)
        .map((item, index) => ({
          ...item,
          sort_order: index,
        }))

      setPhotos(nextPhotos)

      // cập nhật lại sort_order cho gọn
      for (const item of nextPhotos) {
        await supabase
          .from('profile_photos')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id)
          .eq('user_id', userId)
      }

      setSuccess('Đã xóa ảnh phụ.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Ảnh phụ kiểu gallery</h2>
          <p className="mt-1 text-sm text-gray-600">
            Tối đa {MAX_PHOTOS} ảnh. Hỗ trợ JPG, PNG, WEBP, HEIC, HEIF. Mỗi ảnh tối đa 5MB.
          </p>
        </div>

        <div className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700">
          {photos.length}/{MAX_PHOTOS}
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-gray-200 bg-pink-50/40 p-4">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600">
          <ImagePlus className="h-4 w-4" />
          Thêm ảnh phụ
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={handleFilesChange}
            disabled={loading || remainingSlots <= 0}
            className="hidden"
          />
        </label>

        <p className="mt-2 text-xs text-gray-500">
          Mẹo: chọn ảnh rõ mặt, hoạt động hàng ngày, du lịch, sở thích để hồ sơ hấp dẫn hơn.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {success}
        </div>
      ) : null}

      {photos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          Bạn chưa có ảnh phụ nào.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="aspect-[4/5]">
                <img
                  src={photo.image_url}
                  alt={`Ảnh phụ ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
                #{index + 1}
              </div>

              <button
                type="button"
                onClick={() => handleDeletePhoto(photo)}
                disabled={loading}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-red-500 shadow hover:bg-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}