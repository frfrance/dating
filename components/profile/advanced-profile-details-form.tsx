'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ADVANCED_PROFILE_FIELDS,
  ExtraProfileField,
} from '@/lib/profile-extra-fields'
import { createClient } from '@/lib/supabase/client'

type AdvancedProfileDetailsFormProps = {
  profileId: string
  initialData: Record<string, string> | null | undefined
}

export default function AdvancedProfileDetailsForm({
  profileId,
  initialData,
}: AdvancedProfileDetailsFormProps) {
  const supabase = createClient()
  const router = useRouter()

  const [formData, setFormData] = useState<Record<string, string>>(initialData ?? {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const groups = useMemo(() => {
    return ADVANCED_PROFILE_FIELDS.reduce<Record<string, ExtraProfileField[]>>(
      (acc, field) => {
        if (!acc[field.group]) acc[field.group] = []
        acc[field.group].push(field)
        return acc
      },
      {}
    )
  }, [])

  function setField(key: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      setLoading(true)

      const { data: currentProfile, error: readError } = await supabase
        .from('profiles')
        .select('extra_profile_data')
        .eq('id', profileId)
        .maybeSingle()

      if (readError) {
        setError(readError.message)
        return
      }

      const merged = {
        ...(currentProfile?.extra_profile_data ?? {}),
        ...formData,
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          extra_profile_data: merged,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess('Đã lưu thông tin bổ sung.')
      router.refresh()
    } catch {
      setError('Đã có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Thông tin thêm về bạn</h2>
        <p className="mt-2 text-sm text-gray-600">
          Càng điền chi tiết, hồ sơ của bạn càng dễ match đúng người phù hợp.
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(groups).map(([groupName, fields]) => (
          <section key={groupName}>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">{groupName}</h3>

            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => {
                const value = formData[field.key] || ''

                return (
                  <div
                    key={field.key}
                    className={field.type === 'textarea' ? 'md:col-span-2' : ''}
                  >
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      {field.label}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        value={value}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-black outline-none"
                      >
                        <option value="">Chọn câu trả lời</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={value}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="min-h-28 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black outline-none"
                        placeholder={field.placeholder || ''}
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-black outline-none"
                        placeholder={field.placeholder || ''}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-600">
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-2xl bg-pink-500 px-5 py-3 font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
      >
        {loading ? 'Đang lưu...' : 'Lưu thông tin thêm'}
      </button>
    </form>
  )
}