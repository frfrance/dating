import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingForm from '@/components/onboarding/onboarding-form'
import ProfileGalleryEditor from '@/components/profile/profile-gallery-editor'
import AdvancedProfileDetailsForm from '@/components/profile/advanced-profile-details-form'

type GalleryPhotoItem = {
  id: string
  image_url: string
  storage_path: string | null
  sort_order: number
}

function EditProfileSectionFallback({
  title,
}: {
  title: string
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
      Đang tải {title.toLowerCase()}...
    </div>
  )
}

export default async function EditProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      onboarding_completed,
      full_name,
      birth_date,
      gender,
      looking_for,
      bio,
      city,
      country,
      country_code,
      search_country,
      search_country_code,
      search_city,
      search_mode,
      first_date_idea,
      weekend_habit,
      interests,
      avatar_url,
      avatar_storage_path,
      preferred_age_min,
      preferred_age_max,
      allow_intro_messages,
      incoming_intro_limit_mode,
      incoming_intro_daily_limit,
      extra_profile_data
    `)
    .eq('id', user.id)
    .maybeSingle()

  if (error || !profile) {
    return <div className="text-red-600">Không tải được hồ sơ để chỉnh sửa.</div>
  }

  const { data: photos, error: photosError } = await supabase
    .from('profile_photos')
    .select('id, image_url, storage_path, sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  if (photosError) {
    return <div className="text-red-600">Không tải được thư viện ảnh.</div>
  }

  const safePhotos: GalleryPhotoItem[] = (photos || []).map((photo) => ({
    id: photo.id,
    image_url: photo.image_url,
    storage_path: photo.storage_path,
    sort_order: photo.sort_order,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h1>
        <p className="mt-2 text-sm text-gray-600">
          Cập nhật đầy đủ thông tin để tăng tỷ lệ match với người phù hợp hơn.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Thông tin cơ bản</h2>
          <p className="mt-1 text-sm text-gray-600">
            Cập nhật ảnh đại diện, bio, khu vực kết nối và các thông tin chính.
          </p>
        </div>

        <Suspense fallback={<EditProfileSectionFallback title="Thông tin cơ bản" />}>
          <OnboardingForm profile={profile} mode="edit" />
        </Suspense>
      </div>

      <Suspense fallback={<EditProfileSectionFallback title="Thư viện ảnh" />}>
        <ProfileGalleryEditor userId={user.id} initialPhotos={safePhotos} />
      </Suspense>

      <Suspense fallback={<EditProfileSectionFallback title="Thông tin nâng cao" />}>
        <AdvancedProfileDetailsForm
          profileId={user.id}
          initialData={profile.extra_profile_data}
        />
      </Suspense>
    </div>
  )
}