import { redirect } from 'next/navigation'
import { CalendarDays, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

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
      avatar_url,
      first_date_idea,
      weekend_habit,
      interests
    `)
    .eq('id', id)
    .maybeSingle()

  if (error || !profile) {
    return <div className="text-red-600">Không tìm thấy hồ sơ này.</div>
  }

  const { data: photos } = await supabase
    .from('profile_photos')
    .select('id, image_url, sort_order')
    .eq('user_id', id)
    .order('sort_order', { ascending: true })

  const age = getAgeFromBirthDate(profile.birth_date)

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-gray-100">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Avatar'}
                className="aspect-[4/5] h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div className="p-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.full_name} {age ? `, ${age}` : ''}
            </h1>

            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-pink-500" />
                <span>{profile.city}, {profile.country}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-pink-500" />
                <span>{profile.gender || 'Chưa cập nhật giới tính'}</span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Giới thiệu</h2>
              <p className="mt-2 text-gray-700">{profile.bio || 'Chưa có mô tả.'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Gallery</h2>
        {!photos || photos.length === 0 ? (
          <p className="text-sm text-gray-500">Người này chưa có ảnh phụ.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-3xl border border-gray-200">
                <img
                  src={photo.image_url}
                  alt="Ảnh phụ"
                  className="aspect-[4/5] h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Buổi hẹn đầu tiên lý tưởng</h2>
          <p className="text-gray-700">{profile.first_date_idea || 'Chưa cập nhật.'}</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Cuối tuần của người ấy</h2>
          <p className="text-gray-700">{profile.weekend_habit || 'Chưa cập nhật.'}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Sở thích</h2>
        <div className="flex flex-wrap gap-2">
          {(profile.interests || []).map((interest: string) => (
            <span
              key={interest}
              className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}