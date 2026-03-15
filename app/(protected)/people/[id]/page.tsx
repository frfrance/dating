import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  CalendarDays,
  ChevronLeft,
  MapPin,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import VipBadge from '@/components/profile/vip-badge'
import PersonMessageButton from '@/components/people/person-message-button'
import { EXTRA_PROFILE_FIELDS } from '@/lib/profile-extra-fields'

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

function formatGender(value: string | null) {
  if (value === 'male') return 'Nam'
  if (value === 'female') return 'Nữ'
  if (value === 'other') return 'Khác'
  return 'Chưa cập nhật'
}

function formatLookingFor(value: string) {
  if (value === 'male') return 'Nam'
  if (value === 'female') return 'Nữ'
  if (value === 'both') return 'Cả hai'
  return value
}

function formatExtraFieldValue(
  key: string,
  value: string | null | undefined
): string | null {
  if (!value || !String(value).trim()) return null

  const field = EXTRA_PROFILE_FIELDS.find((item) => item.key === key)
  if (!field) return value

  if (field.type === 'select' && field.options?.length) {
    const option = field.options.find((item) => item.value === value)
    return option?.label || value
  }

  return value
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

  const { data: me } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = !!me?.is_admin

  let profileQuery = supabase
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
      is_vip,
      onboarding_completed,
      extra_profile_data
    `)
    .eq('id', id)

  if (!isAdmin) {
    profileQuery = profileQuery.eq('onboarding_completed', true)
  }

  const { data: profile, error } = await profileQuery.maybeSingle()

  if (error || !profile) {
    return <div className="text-red-600">Không tải được hồ sơ người dùng.</div>
  }

  const { data: photos } = await supabase
    .from('profile_photos')
    .select('id, image_url, sort_order')
    .eq('user_id', id)
    .order('sort_order', { ascending: true })

  const otherConversationIdsResult = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', id)

  const otherConversationIds =
    otherConversationIdsResult.data?.map((row) => row.conversation_id) || []

  const { data: existingConversation } =
    otherConversationIds.length > 0
      ? await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', user.id)
          .in('conversation_id', otherConversationIds)
          .maybeSingle()
      : { data: null as { conversation_id: string } | null }

  const age = getAgeFromBirthDate(profile.birth_date)
  const displayName = profile.full_name?.trim() || 'Người dùng'
  const extraData = (profile.extra_profile_data || {}) as Record<string, string>

  const filledExtraFields = EXTRA_PROFILE_FIELDS
    .map((field) => ({
      key: field.key,
      label: field.label,
      group: field.group,
      value: formatExtraFieldValue(field.key, extraData[field.key]),
    }))
    .filter((item) => item.value)

  const groupedExtraFields = filledExtraFields.reduce(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = []
      acc[item.group].push(item)
      return acc
    },
    {} as Record<string, typeof filledExtraFields>
  )

  const showMessageButton = !isAdmin

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={isAdmin ? '/admin/vip-requests' : '/discover'}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>

      {!profile.onboarding_completed ? (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          Hồ sơ này chưa hoàn tất onboarding. Admin vẫn có thể xem để phục vụ duyệt VIP.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-pink-100 bg-gray-100">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                  Chưa có ảnh
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {displayName}
                  {age ? `, ${age}` : ''}
                </h1>
                <VipBadge isVip={profile.is_vip} />
              </div>

              <p className="mt-1 text-sm text-gray-500">
                {formatGender(profile.gender)}
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

            {showMessageButton ? (
              <div className="mt-6">
                <PersonMessageButton
                  targetUserId={profile.id}
                  targetUserName={displayName}
                  existingConversationId={existingConversation?.conversation_id ?? null}
                />
              </div>
            ) : null}
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
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <UserRound className="h-4 w-4 text-pink-500" />
              Thông tin cơ bản
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-gray-500">Tên hiển thị</div>
                <div className="mt-1 text-gray-900">{displayName}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Giới tính</div>
                <div className="mt-1 text-gray-900">{formatGender(profile.gender)}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Ngày sinh</div>
                <div className="mt-1 text-gray-900">
                  {profile.birth_date || 'Chưa cập nhật'}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Tuổi</div>
                <div className="mt-1 text-gray-900">
                  {age ? `${age} tuổi` : 'Chưa cập nhật'}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Quốc gia đang sống</div>
                <div className="mt-1 text-gray-900">
                  {profile.country || 'Chưa cập nhật'}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Thành phố đang sống</div>
                <div className="mt-1 text-gray-900">
                  {profile.city || 'Chưa cập nhật'}
                </div>
              </div>
            </div>
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
                    {formatLookingFor(item)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Khu vực và tiêu chí kết nối
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-gray-500">Nơi tìm tình yêu</div>
                <div className="mt-1 text-gray-900">
                  {profile.search_mode === 'city' && profile.search_city
                    ? `${profile.search_city}, ${profile.search_country || profile.country || ''}`
                    : `Toàn bộ ${profile.search_country || profile.country || 'khu vực đã chọn'}`}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Độ tuổi muốn kết nối</div>
                <div className="mt-1 text-gray-900">
                  {profile.preferred_age_min ?? 18} - {profile.preferred_age_max ?? 60}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Buổi hẹn đầu tiên lý tưởng
            </h2>
            <p className="whitespace-pre-wrap text-gray-700">
              {profile.first_date_idea || 'Chưa cập nhật.'}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Cuối tuần lý tưởng</h2>
            <p className="whitespace-pre-wrap text-gray-700">
              {profile.weekend_habit || 'Chưa cập nhật.'}
            </p>
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

          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin thêm về bạn</h2>
            <p className="mt-2 text-sm text-gray-600">
              Càng điền chi tiết, hồ sơ của bạn càng dễ match đúng người phù hợp.
            </p>

            {filledExtraFields.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">Chưa cập nhật thêm thông tin.</p>
            ) : (
              <div className="mt-6 space-y-6">
                {Object.entries(groupedExtraFields).map(([groupName, fields]) => (
                  <div key={groupName}>
                    <h3 className="mb-3 text-base font-semibold text-gray-900">
                      {groupName}
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      {fields.map((field) => (
                        <div key={field.key} className="rounded-2xl bg-gray-50 p-4">
                          <div className="text-sm font-medium text-gray-500">
                            {field.label}
                          </div>
                          <div className="mt-1 whitespace-pre-wrap text-gray-900">
                            {field.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}