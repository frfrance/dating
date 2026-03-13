import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import StrangerMessageSettingsForm from '@/components/settings/stranger-message-settings-form'
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

const profileLinks = [
  { href: '/report-issue', label: 'Báo cáo sự cố' },
  { href: '/change-password', label: 'Đổi mật khẩu' },
  { href: '/privacy-policy', label: 'Chính sách bảo mật' },
  { href: '/terms-of-service', label: 'Điều khoản dịch vụ' },
  { href: '/impressum', label: 'Impressum' },
]

export default async function ProfilePage() {
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
      allow_intro_messages,
      incoming_intro_limit_mode,
      incoming_intro_daily_limit,
      extra_profile_data
    `)
    .eq('id', user.id)
    .maybeSingle()

  if (error || !profile) {
    return <div className="text-red-600">Không tải được hồ sơ.</div>
  }

  const { data: photos } = await supabase
    .from('profile_photos')
    .select('id, image_url, sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  const age = getAgeFromBirthDate(profile.birth_date)

  return (
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
              {profile.full_name || 'Chưa cập nhật tên'}
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
                Độ tuổi muốn kết nối:{' '}
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

          <Link
            href="/profile/edit"
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-pink-500 px-4 py-3 font-medium text-white hover:bg-pink-600"
          >
            Chỉnh sửa hồ sơ
          </Link>
        </div>

        <StrangerMessageSettingsForm
          profile={{
            id: profile.id,
            allow_intro_messages: profile.allow_intro_messages,
            incoming_intro_limit_mode: profile.incoming_intro_limit_mode,
            incoming_intro_daily_limit: profile.incoming_intro_daily_limit,
          }}
        />
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
            <p className="text-sm text-gray-500">Bạn chưa thêm ảnh phụ nào.</p>
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
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Bạn muốn gặp ai</h2>

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
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Cuối tuần của bạn</h2>
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

        <div className="rounded-3xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-2 px-2 text-lg font-semibold text-gray-900">
            Hỗ trợ & pháp lý
          </div>

          <div className="divide-y divide-gray-100">
            {profileLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-2xl px-3 py-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <span>{item.label}</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}