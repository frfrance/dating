import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  CalendarDays,
  ChevronLeft,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AdvancedProfileDetailsView from '@/components/profile/advanced-profile-details-view'

function getAgeFromBirthDate(birthDate: string | null) {
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

export default async function PersonProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
      full_name,
      birth_date,
      gender,
      bio,
      city,
      country,
      search_country,
      search_city,
      search_mode,
      looking_for,
      avatar_url,
      first_date_idea,
      weekend_habit,
      interests,
      preferred_age_min,
      preferred_age_max,
      extra_profile_data
    `)
    .eq('id', id)
    .eq('onboarding_completed', true)
    .maybeSingle()

  if (error || !profile) {
    return <div className="text-red-600">Không tải được hồ sơ người dùng.</div>
  }

  const { data: photos } = await supabase
    .from('profile_photos')
    .select('id, image_url, sort_order')
    .eq('user_id', id)
    .order('sort_order', { ascending: true })

  const age = getAgeFromBirthDate(profile.birth_date)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-pink-100 bg-gray-100">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Avatar'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                  Chưa có ảnh
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.full_name || 'Người dùng'}
                {age ? `, ${age}` : ''}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {profile.gender || 'Chưa cập nhật giới tính'}
              </p>
            </div>

            <div className="mt-6 space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-pink-500" />
                <span>
                  {profile.city || 'Chưa cập nhật thành phố'}
                  {profile.country ? `, ${profile.country}` : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-pink-500" />
                <span>
                  Muốn kết nối với độ tuổi:{' '}
                  {profile.preferred_age_min ?? 18} - {profile.preferred_age_max ?? 60}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Search className="mt-0.5 h-4 w-4 text-pink-500" />
                <span>
                  Tìm ở:{' '}
                  {profile.search_mode === 'city' && profile.search_city
                    ? `${profile.search_city}, ${profile.search_country || profile.country || ''}`
                    : `toàn bộ ${profile.search_country || profile.country || 'khu vực đã chọn'}`}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Sparkles className="h-4 w-4 text-pink-500" />
              Giới thiệu
            </div>
            <p className="text-gray-700">{profile.bio || 'Chưa có mô tả.'}</p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Ảnh phụ</h2>

            {!photos || photos.length === 0 ? (
              <p className="text-sm text-gray-500">Người dùng này chưa thêm ảnh phụ nào.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="aspect-[4/5]">
                      <img
                        src={photo.image_url}
                        alt="Ảnh phụ"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Muốn gặp ai</h2>

            {(profile.looking_for || []).length === 0 ? (
              <p className="text-sm text-gray-500">Chưa cập nhật.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile.looking_for || []).map((item: string) => (
                  <span
                    key={item}
                    className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700"
                  >
                    {item === 'male' ? 'Nam' : item === 'female' ? 'Nữ' : 'Cả hai'}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Buổi hẹn đầu tiên lý tưởng
            </h2>
            <p className="text-gray-700">{profile.first_date_idea || 'Chưa cập nhật.'}</p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Cuối tuần lý tưởng</h2>
            <p className="text-gray-700">{profile.weekend_habit || 'Chưa cập nhật.'}</p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Sở thích</h2>

            {(profile.interests || []).length === 0 ? (
              <p className="text-sm text-gray-500">Chưa cập nhật.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(profile.interests || []).map((interest: string) => (
                  <span
                    key={interest}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          <AdvancedProfileDetailsView data={profile.extra_profile_data} />
        </section>
      </div>
    </div>
  )
}