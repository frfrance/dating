import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarDays, Heart, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import VipBadge from '@/components/profile/vip-badge'

type MatchRow = {
  match_id: string
  conversation_id: string | null
  other_user_id: string
  other_user_full_name: string | null
  other_user_birth_date: string | null
  other_user_city: string | null
  other_user_country: string | null
  other_user_avatar_url: string | null
  other_user_is_vip?: boolean | null
  matched_at: string
}

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

export default async function ConnectPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: matchesData, error } = await supabase.rpc('get_my_matches')

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được danh sách kết nối: {error.message}
      </div>
    )
  }

  const { data: likesCountData } = await supabase.rpc('get_likes_me_count')
  const likesCount = Number(likesCountData || 0)

  const { data: canSeeLikesData } = await supabase.rpc('can_current_user_see_who_liked')
  const canSeeLikes = Boolean(canSeeLikesData)

  const matches = (matchesData || []) as MatchRow[]

  const likesHref = canSeeLikes ? '/likes-you' : '/upgrade'

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kết nối</h1>
        <p className="mt-2 text-sm text-gray-600">
          Những người đã match thành công với bạn.
        </p>
      </div>

      <Link
        href={likesHref}
        className="flex items-center justify-between rounded-3xl border border-pink-100 bg-pink-50 p-5 shadow-sm transition hover:bg-pink-100"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-pink-500 p-3 text-white">
            <Heart className="h-5 w-5 fill-current" />
          </div>

          <div>
            <div className="text-lg font-bold text-gray-900">
              Có {likesCount} người thích bạn
            </div>
            <div className="text-sm text-gray-600">
              {canSeeLikes
                ? 'Bấm để xem chi tiết những người đã thích bạn.'
                : 'Bấm để mở khóa tính năng xem ai đã thích bạn.'}
            </div>
          </div>
        </div>

        <span className="text-sm font-medium text-pink-700">
          {canSeeLikes ? 'Xem chi tiết' : 'Nâng cấp'}
        </span>
      </Link>

      {matches.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          Bạn chưa có match nào.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((item) => {
            const age = getAgeFromBirthDate(item.other_user_birth_date)
            const displayName =
              item.other_user_full_name?.trim() || 'Người dùng chưa cập nhật tên'

            return (
              <div
                key={item.match_id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] bg-gray-100">
                  {item.other_user_avatar_url ? (
                    <img
                      src={item.other_user_avatar_url}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-pink-100 text-3xl font-bold text-pink-700">
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">
                        {displayName} {age ? `, ${age}` : ''}
                      </h2>
                      <VipBadge isVip={item.other_user_is_vip} />
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-pink-500" />
                        <span>
                          {item.other_user_city || 'Chưa cập nhật thành phố'}
                          {item.other_user_country ? `, ${item.other_user_country}` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-pink-500" />
                        <span>
                          Match ngày {new Date(item.matched_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={`/people/${item.other_user_id}`}
                      className="flex items-center justify-center rounded-2xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Xem profile
                    </Link>

                    {item.conversation_id ? (
                      <Link
                        href={`/messages/${item.conversation_id}`}
                        className="flex items-center justify-center rounded-2xl bg-pink-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-pink-600"
                      >
                        Nhắn tin
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="rounded-2xl bg-gray-200 px-4 py-3 text-sm font-medium text-gray-500"
                      >
                        Chưa có chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}