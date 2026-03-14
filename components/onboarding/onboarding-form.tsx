'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Heart,
  ImagePlus,
  MapPin,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react'

import { resizeImageFile } from '@/lib/image-resize'
import { createClient } from '@/lib/supabase/client'
import { getCitiesByCountryCode, getEuCountries } from '@/lib/location-data'
import { SearchCombobox } from '@/components/ui/search-combobox'
import { ONBOARDING_REQUIRED_FIELDS } from '@/lib/profile-extra-fields'

type Profile = {
  id: string
  email: string | null
  onboarding_completed: boolean
  full_name: string | null
  birth_date: string | null
  gender: string | null
  looking_for: string[] | null
  bio: string | null
  city: string | null
  country: string | null
  country_code?: string | null
  search_country?: string | null
  search_country_code?: string | null
  search_city?: string | null
  search_mode?: 'country' | 'city' | null
  first_date_idea: string | null
  weekend_habit: string | null
  interests: string[] | null
  avatar_url: string | null
  avatar_storage_path?: string | null
  preferred_age_min?: number | null
  preferred_age_max?: number | null
  extra_profile_data?: Record<string, string> | null
}

type OnboardingFormProps = {
  profile: Profile
  mode?: 'onboarding' | 'edit'
}

const AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const DEFAULT_COUNTRY_CODE = 'DE'

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]

export default function OnboardingForm({
  profile,
  mode = 'onboarding',
}: OnboardingFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const isEditMode = mode === 'edit'

  const euCountries = useMemo(() => getEuCountries(), [])

  const detectedCountryCode =
    profile.country_code ||
    euCountries.find((c) => c.name === (profile.country ?? ''))?.code ||
    DEFAULT_COUNTRY_CODE

  const detectedSearchCountryCode =
    profile.search_country_code ||
    detectedCountryCode ||
    DEFAULT_COUNTRY_CODE

  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [birthDate, setBirthDate] = useState(profile.birth_date ?? '')
  const [gender, setGender] = useState(profile.gender ?? '')
  const [lookingFor, setLookingFor] = useState<string[]>(
    profile.looking_for && profile.looking_for.length > 0
      ? profile.looking_for
      : ['female']
  )
  const [bio, setBio] = useState(profile.bio ?? '')

  const [countryCode, setCountryCode] = useState(detectedCountryCode)
  const [country, setCountry] = useState(profile.country ?? '')
  const [city, setCity] = useState(profile.city ?? '')

  const [searchMode, setSearchMode] = useState<'country' | 'city'>(
    profile.search_mode === 'city' ? 'city' : 'country'
  )
  const [searchCountryCode, setSearchCountryCode] = useState(
    detectedSearchCountryCode
  )
  const [searchCountry, setSearchCountry] = useState(
    profile.search_country || profile.country || ''
  )
  const [searchCity, setSearchCity] = useState(profile.search_city ?? '')

  const [firstDateIdea, setFirstDateIdea] = useState(profile.first_date_idea ?? '')
  const [weekendHabit, setWeekendHabit] = useState(profile.weekend_habit ?? '')
  const [interests, setInterests] = useState(
    profile.interests ? profile.interests.join(', ') : ''
  )

  const [preferredAgeMin, setPreferredAgeMin] = useState(
    profile.preferred_age_min ?? 22
  )
  const [preferredAgeMax, setPreferredAgeMax] = useState(
    profile.preferred_age_max ?? 35
  )

  const [extraProfileData, setExtraProfileData] = useState<Record<string, string>>(
    profile.extra_profile_data ?? {}
  )

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url ?? '')

  const [cities, setCities] = useState<{ name: string }[]>([])
  const [searchCities, setSearchCities] = useState<{ name: string }[]>([])

  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingSearchCities, setLoadingSearchCities] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const selectedCountry = euCountries.find((item) => item.code === countryCode)
    setCountry(selectedCountry?.name ?? '')
  }, [countryCode, euCountries])

  useEffect(() => {
    const selectedSearchCountry = euCountries.find(
      (item) => item.code === searchCountryCode
    )
    setSearchCountry(selectedSearchCountry?.name ?? '')
  }, [searchCountryCode, euCountries])

  useEffect(() => {
    if (!countryCode) {
      setCities([])
      setCity('')
      return
    }

    setLoadingCities(true)
    try {
      const cityList = getCitiesByCountryCode(countryCode)
      setCities(cityList)

      const stillExists = cityList.some((item) => item.name === city)
      if (!stillExists) {
        setCity('')
      }
    } finally {
      setLoadingCities(false)
    }
  }, [countryCode, city])

  useEffect(() => {
    if (!searchCountryCode) {
      setSearchCities([])
      setSearchCity('')
      return
    }

    setLoadingSearchCities(true)
    try {
      const cityList = getCitiesByCountryCode(searchCountryCode)
      setSearchCities(cityList)

      const stillExists = cityList.some((item) => item.name === searchCity)
      if (!stillExists) {
        setSearchCity('')
      }
    } finally {
      setLoadingSearchCities(false)
    }
  }, [searchCountryCode, searchCity])

  useEffect(() => {
    if (!profile.country && !profile.country_code) {
      setCountryCode(DEFAULT_COUNTRY_CODE)
    }

    if (!profile.search_country && !profile.search_country_code) {
      setSearchCountryCode(DEFAULT_COUNTRY_CODE)
      setSearchMode('country')
    }
  }, [profile.country, profile.country_code, profile.search_country, profile.search_country_code])

  function handleGenderChange(value: string) {
    setGender(value)

    if (value === 'male') {
      setLookingFor(['female'])
    } else if (value === 'female') {
      setLookingFor(['male'])
    }
  }

  function toggleLookingFor(value: string) {
    setLookingFor((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    )
  }

  function handleMinAgeChange(value: number) {
    const nextMin = Math.min(value, preferredAgeMax)
    setPreferredAgeMin(nextMin)
  }

  function handleMaxAgeChange(value: number) {
    const nextMax = Math.max(value, preferredAgeMin)
    setPreferredAgeMax(nextMax)
  }

  function setExtraField(key: string, value: string) {
    setExtraProfileData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setError('')
    setSuccess('')

    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Ảnh không hợp lệ. Hãy chọn JPG, PNG, WEBP, HEIC hoặc HEIF.')
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError('Ảnh đại diện vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.')
      return
    }

    try {
      const resizedFile = await resizeImageFile(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.82,
        outputType: 'image/jpeg',
      })

      setAvatarFile(resizedFile)
      const previewUrl = URL.createObjectURL(resizedFile)
      setAvatarPreview(previewUrl)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không thể xử lý ảnh đại diện.'
      setError(message)
    }
  }

  async function uploadAvatarIfNeeded() {
    if (!avatarFile) {
      return {
        avatarUrl: profile.avatar_url ?? null,
        avatarStoragePath: profile.avatar_storage_path ?? null,
      }
    }

    const fileExt = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg'
    const newFilePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(newFilePath, avatarFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: avatarFile.type,
      })

    if (uploadError) {
      throw new Error(`Upload ảnh đại diện thất bại: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(newFilePath)

    const oldAvatarStoragePath = profile.avatar_storage_path ?? null

    if (oldAvatarStoragePath && oldAvatarStoragePath !== newFilePath) {
      const { error: removeError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .remove([oldAvatarStoragePath])

      if (removeError) {
        console.error('Không thể xóa ảnh đại diện cũ:', removeError.message)
      }
    }

    return {
      avatarUrl: publicUrlData.publicUrl,
      avatarStoragePath: newFilePath,
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      return setError('Vui lòng nhập tên hiển thị.')
    }

    if (!birthDate) {
      return setError('Vui lòng chọn ngày sinh.')
    }

    if (!gender) {
      return setError('Vui lòng chọn giới tính.')
    }

    if (!bio.trim()) {
      return setError('Vui lòng nhập mô tả về bản thân.')
    }

    const interestsArray = interests
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (
      preferredAgeMin < 18 ||
      preferredAgeMax > 60 ||
      preferredAgeMin > preferredAgeMax
    ) {
      return setError('Khoảng tuổi kết nối không hợp lệ.')
    }

    try {
      setLoading(true)

      const { avatarUrl, avatarStoragePath } = await uploadAvatarIfNeeded()

      const finalSearchCountryCode = searchCountryCode || countryCode || DEFAULT_COUNTRY_CODE
      const finalSearchCountry =
        euCountries.find((item) => item.code === finalSearchCountryCode)?.name ||
        country ||
        'Germany'

      const finalSearchMode =
        searchMode === 'city' && searchCity?.trim() ? 'city' : 'country'
      const finalSearchCity =
        finalSearchMode === 'city' ? searchCity.trim() : null

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          birth_date: birthDate,
          gender,
          looking_for: lookingFor,
          bio: bio.trim(),
          country,
          country_code: countryCode,
          city: city || null,
          search_country: finalSearchCountry,
          search_country_code: finalSearchCountryCode,
          search_city: finalSearchCity,
          search_mode: finalSearchMode,
          avatar_url: avatarUrl,
          avatar_storage_path: avatarStoragePath,
          first_date_idea: firstDateIdea.trim() || null,
          weekend_habit: weekendHabit.trim() || null,
          interests: interestsArray,
          preferred_age_min: preferredAgeMin,
          preferred_age_max: preferredAgeMax,
          extra_profile_data: {
            ...(profile.extra_profile_data ?? {}),
            ...extraProfileData,
          },
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(
        isEditMode ? 'Đã lưu thông tin cơ bản.' : 'Hoàn tất hồ sơ thành công.'
      )

      router.refresh()

      if (!isEditMode) {
        router.push('/profile')
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const countryOptions = euCountries

  const cityOptions = useMemo(
    () =>
      cities.map((item) => ({
        value: item.name,
        label: item.name,
      })),
    [cities]
  )

  const searchCityOptions = useMemo(
    () =>
      searchCities.map((item) => ({
        value: item.name,
        label: item.name,
      })),
    [searchCities]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      {!isEditMode ? (
        <>
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700">
            <Sparkles className="h-4 w-4" />
            Hoàn thiện hồ sơ của bạn
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Tạo hồ sơ thật thu hút
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Hãy cho mọi người biết bạn là ai và bạn muốn kết nối với ai.
            </p>
          </div>
        </>
      ) : null}

      <section className="rounded-3xl border border-pink-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <UserRound className="h-4 w-4 text-pink-500" />
          Thông tin cá nhân
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ảnh đại diện
            </label>

            <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-pink-50/40 p-3 sm:p-4 md:flex-row md:items-center">
              <div className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow sm:mx-0 sm:h-28 sm:w-28">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">Chưa có ảnh</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
                  onChange={handleAvatarChange}
                  className="block w-full text-sm text-black file:mb-2 file:mr-3 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-pink-600 sm:file:mb-0 sm:file:mr-4"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Ảnh đại diện là tùy chọn. Hỗ trợ JPG, JPEG, PNG, WEBP, HEIC, HEIF. Tối đa 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tên hiển thị <span className="text-red-500">*</span>
            </label>
            <input
              suppressHydrationWarning
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none placeholder:text-gray-400 sm:rounded-2xl"
              placeholder="Ví dụ: Anna"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Ngày sinh <span className="text-red-500">*</span>
            </label>
            <input
              suppressHydrationWarning
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none sm:rounded-2xl"
              autoComplete="bday"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Giới tính <span className="text-red-500">*</span>
            </label>
            <select
              suppressHydrationWarning
              value={gender}
              onChange={(e) => handleGenderChange(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none sm:rounded-2xl"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Mô tả về bản thân <span className="text-red-500">*</span>
            </label>
            <textarea
              suppressHydrationWarning
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-28 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black shadow-sm outline-none placeholder:text-gray-400 sm:rounded-2xl"
              placeholder="Viết vài dòng thật tự nhiên về bạn..."
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <MapPin className="h-4 w-4 text-orange-500" />
          Bạn đang ở đâu
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Quốc gia (EU)
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none sm:rounded-2xl"
            >
              {countryOptions.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag ? `${item.flag} ` : ''}{item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
  <label className="mb-1.5 block text-sm font-medium text-gray-700">
    Thành phố
  </label>

  <SearchCombobox
    value={city}
    onChange={setCity}
    options={cityOptions}
    placeholder={!countryCode ? 'Chọn quốc gia trước' : 'Gõ để tìm thành phố...'}
    searchPlaceholder={
      loadingCities ? 'Đang tải thành phố...' : 'Nhập tên thành phố...'
    }
    emptyText={
      !countryCode
        ? 'Hãy chọn quốc gia trước.'
        : 'Không tìm thấy thành phố phù hợp.'
    }
    disabled={!countryCode || loadingCities}
  />

  <div className="mt-2 flex items-center justify-between gap-3">
    <p className="text-xs text-gray-500">
      Có thể để trống nếu bạn chưa muốn chọn thành phố.
    </p>

    {city ? (
      <button
        type="button"
        onClick={() => setCity('')}
        className="text-xs font-medium text-pink-600 hover:text-pink-700"
      >
        Bỏ chọn thành phố
      </button>
    ) : null}
  </div>
</div>
        </div>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Search className="h-4 w-4 text-blue-500" />
          Bạn muốn tìm tình yêu ở đâu
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchMode('country')
                setSearchCountryCode(countryCode || DEFAULT_COUNTRY_CODE)
                setSearchCountry(country || 'Germany')
                setSearchCity('')
              }}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                searchMode === 'country'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-blue-50',
              ].join(' ')}
            >
              Toàn bộ quốc gia tôi đang ở
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchMode('city')
              }}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                searchMode === 'city'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-blue-50',
              ].join(' ')}
            >
              Chọn khu vực cụ thể
            </button>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="mb-3 text-sm text-gray-700">
              Nếu để trống thành phố tìm kiếm, hệ thống sẽ tìm trong toàn bộ quốc gia bạn chọn.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Quốc gia tìm kiếm
                </label>
                <select
                  value={searchCountryCode}
                  onChange={(e) => setSearchCountryCode(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none sm:rounded-2xl"
                >
                  {countryOptions.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.flag ? `${item.flag} ` : ''}{item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
  <label className="mb-1.5 block text-sm font-medium text-gray-700">
    Thành phố tìm kiếm
  </label>

  <SearchCombobox
    value={searchCity}
    onChange={setSearchCity}
    options={searchCityOptions}
    placeholder={
      !searchCountryCode
        ? 'Chọn quốc gia trước'
        : 'Để trống nếu muốn tìm toàn quốc gia'
    }
    searchPlaceholder={
      loadingSearchCities
        ? 'Đang tải thành phố...'
        : 'Nhập tên thành phố...'
    }
    emptyText={
      !searchCountryCode
        ? 'Hãy chọn quốc gia trước.'
        : 'Không tìm thấy thành phố phù hợp.'
    }
    disabled={!searchCountryCode || loadingSearchCities}
  />

  <div className="mt-2 flex items-center justify-between gap-3">
    <p className="text-xs text-gray-500">
      Nếu để trống, hệ thống sẽ tìm trong toàn bộ quốc gia đã chọn.
    </p>

    {searchCity ? (
      <button
        type="button"
        onClick={() => setSearchCity('')}
        className="text-xs font-medium text-blue-600 hover:text-blue-700"
      >
        Tìm toàn bộ quốc gia
      </button>
    ) : null}
  </div>
</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-rose-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Heart className="h-4 w-4 text-rose-500" />
          Kết nối & sở thích
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Bạn muốn gặp ai?
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'male', label: 'Nam' },
                { value: 'female', label: 'Nữ' },
                { value: 'both', label: 'Cả hai' },
              ].map((option) => {
                const active = lookingFor.includes(option.value)

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleLookingFor(option.value)}
                    className={[
                      'rounded-full px-4 py-2 text-sm font-medium transition',
                      active
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-pink-50',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-pink-100 bg-pink-50 p-4">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Độ tuổi bạn muốn kết nối
            </label>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-pink-600 shadow-sm">
                Từ {preferredAgeMin} tuổi
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-500 shadow-sm">
                Đến {preferredAgeMax} tuổi
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Tuổi tối thiểu</span>
                  <span>{preferredAgeMin}</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={60}
                  step={1}
                  value={preferredAgeMin}
                  onChange={(e) => handleMinAgeChange(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-pink-500"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Tuổi tối đa</span>
                  <span>{preferredAgeMax}</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={60}
                  step={1}
                  value={preferredAgeMax}
                  onChange={(e) => handleMaxAgeChange(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-orange-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Buổi hẹn đầu tiên lý tưởng
            </label>
            <textarea
              suppressHydrationWarning
              value={firstDateIdea}
              onChange={(e) => setFirstDateIdea(e.target.value)}
              className="min-h-24 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black shadow-sm outline-none placeholder:text-gray-400 sm:rounded-2xl"
              placeholder="Ví dụ: cà phê, dạo phố, triển lãm, picnic..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Cuối tuần bạn thường làm gì?
            </label>
            <textarea
              suppressHydrationWarning
              value={weekendHabit}
              onChange={(e) => setWeekendHabit(e.target.value)}
              className="min-h-24 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black shadow-sm outline-none placeholder:text-gray-400 sm:rounded-2xl"
              placeholder="Ví dụ: gym, du lịch ngắn ngày, xem phim, nấu ăn..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Sở thích (ngăn cách bằng dấu phẩy)
            </label>
            <input
              suppressHydrationWarning
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none placeholder:text-gray-400 sm:rounded-2xl"
              placeholder="du lịch, nhiếp ảnh, gym"
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-purple-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 text-sm font-semibold text-gray-700">
          10 thông tin thêm để tăng tỷ lệ match
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {ONBOARDING_REQUIRED_FIELDS.map((field) => {
            const value = extraProfileData[field.key] || ''

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
                    suppressHydrationWarning
                    value={value}
                    onChange={(e) => setExtraField(field.key, e.target.value)}
                    className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none sm:rounded-2xl"
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
                    suppressHydrationWarning
                    value={value}
                    onChange={(e) => setExtraField(field.key, e.target.value)}
                    className="min-h-24 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black shadow-sm outline-none placeholder:text-gray-400 sm:rounded-2xl"
                    placeholder={field.placeholder || ''}
                  />
                ) : (
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={value}
                    onChange={(e) => setExtraField(field.key, e.target.value)}
                    className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none placeholder:text-gray-400 sm:rounded-2xl"
                    placeholder={field.placeholder || ''}
                  />
                )}
              </div>
            )
          })}
        </div>
      </section>

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
        disabled={loading}
        className="w-full rounded-2xl bg-pink-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-pink-600 disabled:opacity-60"
      >
        {loading
          ? 'Đang lưu...'
          : isEditMode
          ? 'Lưu thông tin cơ bản'
          : 'Hoàn tất hồ sơ'}
      </button>
    </form>
  )
}