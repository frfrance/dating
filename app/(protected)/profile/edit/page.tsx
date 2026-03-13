import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingForm from '@/components/onboarding/onboarding-form'
import ProfileGalleryEditor from '@/components/profile/profile-gallery-editor'

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
      preferred_age_min,
      preferred_age_max
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
    return <div className="text-red-600">Không tải được gallery ảnh phụ.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Chỉnh sửa hồ sơ</h1>
        <p className="mt-2 text-sm text-gray-600">
          Cập nhật thông tin cá nhân, khu vực bạn muốn kết nối và gallery ảnh phụ.
        </p>
      </div>

      <OnboardingForm profile={profile} />

      <ProfileGalleryEditor userId={user.id} initialPhotos={photos || []} />
    </div>
  )
}