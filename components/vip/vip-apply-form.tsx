'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type ExistingRequest = {
  id: string
  phone_number: string
  facebook_link: string
  face_image_url: string
  face_image_storage_path: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
} | null

type VipApplyFormProps = {
  userId: string
  isVip: boolean
  isVerifiedMember: boolean
  existingRequest: ExistingRequest
}

const BUCKET = 'vip-verification'
const MAX_FILE_SIZE = 5 * 1024 * 1024

function isValidFacebookLink(url: string) {
  return /facebook\.com|fb\.com/i.test(url)
}

export default function VipApplyForm({
  userId,
  isVip,
  isVerifiedMember,
  existingRequest,
}: VipApplyFormProps) {
  const supabase = createClient()

  const [phoneNumber, setPhoneNumber] = useState(existingRequest?.phone_number ?? '')
  const [facebookLink, setFacebookLink] = useState(existingRequest?.facebook_link ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(existingRequest?.face_image_url ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isApproved = existingRequest?.status === 'approved'
  const isPending = existingRequest?.status === 'pending'

  const statusText = useMemo(() => {
    if (isVip && isVerifiedMember) return 'Bạn đã là thành viên VIP.'
    if (!existingRequest) return 'Bạn chưa gửi yêu cầu VIP.'
    if (existingRequest.status === 'pending') return 'Yêu cầu VIP của bạn đang chờ admin duyệt.'
    if (existingRequest.status === 'approved') return 'Yêu cầu VIP của bạn đã được duyệt.'
    return 'Yêu cầu VIP của bạn đã bị từ chối. Bạn có thể cập nhật và gửi lại.'
  }, [existingRequest, isVip, isVerifiedMember])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setError('')
    setSuccess('')

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn ảnh hợp lệ.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.')
      return
    }

    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function uploadFaceImageIfNeeded() {
    if (!imageFile) {
      return {
        imageUrl: existingRequest?.face_image_url ?? '',
        imageStoragePath: existingRequest?.face_image_storage_path ?? null,
      }
    }

    const oldPath = existingRequest?.face_image_storage_path ?? null
    const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `${userId}/face-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: imageFile.type,
      })

    if (uploadError) {
      throw new Error(`Upload ảnh xác minh thất bại: ${uploadError.message}`)
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 60 * 60 * 24 * 30)

    if (signedError) {
      throw new Error(`Tạo link ảnh xác minh thất bại: ${signedError.message}`)
    }

    if (oldPath && oldPath !== filePath) {
      await supabase.storage.from(BUCKET).remove([oldPath])
    }

    return {
      imageUrl: signedData.signedUrl,
      imageStoragePath: filePath,
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại.')
      return
    }

    if (!facebookLink.trim()) {
      setError('Vui lòng nhập link Facebook.')
      return
    }

    if (!isValidFacebookLink(facebookLink)) {
      setError('Link Facebook không hợp lệ.')
      return
    }

    if (!previewUrl && !imageFile) {
      setError('Vui lòng tải ảnh chụp mặt chính diện.')
      return
    }

    try {
      setLoading(true)

      const { imageUrl, imageStoragePath } = await uploadFaceImageIfNeeded()

      const payload = {
        user_id: userId,
        phone_number: phoneNumber.trim(),
        facebook_link: facebookLink.trim(),
        face_image_url: imageUrl,
        face_image_storage_path: imageStoragePath,
        status: 'pending',
        admin_note: null,
        updated_at: new Date().toISOString(),
      }

      const { error: upsertError } = await supabase
        .from('vip_requests')
        .upsert(payload, {
          onConflict: 'user_id',
        })

      if (upsertError) {
        throw new Error(upsertError.message)
      }

      setSuccess('Đã gửi yêu cầu VIP thành công. Vui lòng chờ admin duyệt.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        {statusText}
        {existingRequest?.admin_note ? (
          <div className="mt-2 text-sm text-rose-600">
            Ghi chú của admin: {existingRequest.admin_note}
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none"
            placeholder="Ví dụ: +49..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Link Facebook
          </label>
          <input
            type="text"
            value={facebookLink}
            onChange={(e) => setFacebookLink(e.target.value)}
            className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none"
            placeholder="https://facebook.com/..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Ảnh chụp mặt chính diện
          </label>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-black file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-pink-600"
            />

            {previewUrl ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                <img
                  src={previewUrl}
                  alt="Ảnh xác minh"
                  className="max-h-[360px] w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || isApproved}
          className="w-full rounded-2xl bg-pink-500 px-5 py-3 font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
        >
          {loading ? 'Đang gửi...' : isPending ? 'Cập nhật yêu cầu VIP' : 'Gửi yêu cầu VIP'}
        </button>
      </form>
    </div>
  )
}