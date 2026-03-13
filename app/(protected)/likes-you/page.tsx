import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LikesYouClient from '@/components/likes-you/likes-you-client'

type Photo = {
  id: string
  image_url: string
  sort_order: number
}

type LikesYouProfile = {
  id: string
  full_name: string
  birth_date: string | null
  bio: string | null
  city: string | null
  country: string | null
  avatar_url: string | null
  liked_at: string
  photos: Photo[]
}

export default async function LikesYouPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: canSeeData, error: canSeeError } = await supabase.rpc(
    'can_current_user_see_who_liked'
  )

  if (canSeeError) {
    return <div className="text-red-600">Không kiểm tra được quyền truy cập.</div>
  }

  if (!canSeeData) {
    redirect('/upgrade')
  }

  const { data, error } = await supabase.rpc('get_people_who_liked_me')

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được danh sách người đã thích bạn: {error.message}
      </div>
    )
  }

  return <LikesYouClient initialProfiles={(data || []) as LikesYouProfile[]} />
}