import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminVipRequestsClient from '@/components/admin/admin-vip-requests-client'

const PAGE_SIZE = 10

export type VipRequestRow = {
  id: string
  user_id: string
  phone_number: string | null
  facebook_link: string | null
  face_image_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
  profile_full_name: string | null
  profile_email: string | null
  profile_avatar_url: string | null
  profile_is_vip: boolean | null
}

export type VipUserRow = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  is_vip: boolean | null
  created_at: string | null
}

type RawVipProfileRow = {
  full_name: string | null
  email: string | null
  avatar_url: string | null
  is_vip: boolean | null
}

type RawVipRequestRow = {
  id: string
  user_id: string
  phone_number: string | null
  facebook_link: string | null
  face_image_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at: string | null
  profiles: RawVipProfileRow[] | null
}

export default async function AdminVipRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ vipPage?: string; nonVipPage?: string }>
}) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams

  const vipPageParam = Number(resolvedSearchParams.vipPage || '1')
  const nonVipPageParam = Number(resolvedSearchParams.nonVipPage || '1')

  const currentVipPage =
    Number.isFinite(vipPageParam) && vipPageParam > 0 ? vipPageParam : 1
  const currentNonVipPage =
    Number.isFinite(nonVipPageParam) && nonVipPageParam > 0 ? nonVipPageParam : 1

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

  if (!me?.is_admin) {
    redirect('/discover')
  }

  const { data: rawPendingRequests, error: pendingError } = await supabase
    .from('vip_requests')
    .select(`
      id,
      user_id,
      phone_number,
      facebook_link,
      face_image_url,
      status,
      created_at,
      reviewed_at,
      profiles!vip_requests_user_id_fkey (
        full_name,
        email,
        avatar_url,
        is_vip
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (pendingError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được yêu cầu VIP: {pendingError.message}
      </div>
    )
  }

  const pendingRequests: VipRequestRow[] = (
    (rawPendingRequests || []) as unknown as RawVipRequestRow[]
  ).map((item) => {
    const profile = item.profiles?.[0] ?? null

    return {
      id: item.id,
      user_id: item.user_id,
      phone_number: item.phone_number,
      facebook_link: item.facebook_link,
      face_image_url: item.face_image_url,
      status: item.status,
      created_at: item.created_at,
      reviewed_at: item.reviewed_at,
      profile_full_name: profile?.full_name ?? null,
      profile_email: profile?.email ?? null,
      profile_avatar_url: profile?.avatar_url ?? null,
      profile_is_vip: profile?.is_vip ?? null,
    }
  })

  const { count: vipCount, error: vipCountError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_vip', true)

  if (vipCountError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được tổng số VIP: {vipCountError.message}
      </div>
    )
  }

  const { count: nonVipCount, error: nonVipCountError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_vip', false)

  if (nonVipCountError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được tổng số không VIP: {nonVipCountError.message}
      </div>
    )
  }

  const totalVipUsers = Number(vipCount || 0)
  const totalNonVipUsers = Number(nonVipCount || 0)

  const totalVipPages = Math.max(1, Math.ceil(totalVipUsers / PAGE_SIZE))
  const totalNonVipPages = Math.max(1, Math.ceil(totalNonVipUsers / PAGE_SIZE))

  const safeVipPage = Math.min(currentVipPage, totalVipPages)
  const safeNonVipPage = Math.min(currentNonVipPage, totalNonVipPages)

  const safeVipFrom = (safeVipPage - 1) * PAGE_SIZE
  const safeVipTo = safeVipFrom + PAGE_SIZE - 1

  const safeNonVipFrom = (safeNonVipPage - 1) * PAGE_SIZE
  const safeNonVipTo = safeNonVipFrom + PAGE_SIZE - 1

  const { data: vipUsers, error: vipError } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, is_vip, created_at')
    .eq('is_vip', true)
    .order('updated_at', { ascending: false })
    .range(safeVipFrom, safeVipTo)

  if (vipError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được danh sách VIP: {vipError.message}
      </div>
    )
  }

  const { data: nonVipUsers, error: nonVipError } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, is_vip, created_at')
    .eq('is_vip', false)
    .order('created_at', { ascending: false })
    .range(safeNonVipFrom, safeNonVipTo)

  if (nonVipError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được danh sách không VIP: {nonVipError.message}
      </div>
    )
  }

  return (
    <AdminVipRequestsClient
      initialPendingRequests={pendingRequests}
      initialVipUsers={(vipUsers || []) as VipUserRow[]}
      initialNonVipUsers={(nonVipUsers || []) as VipUserRow[]}
      currentVipPage={safeVipPage}
      totalVipPages={totalVipPages}
      totalVipUsers={totalVipUsers}
      currentNonVipPage={safeNonVipPage}
      totalNonVipPages={totalNonVipPages}
      totalNonVipUsers={totalNonVipUsers}
      pageSize={PAGE_SIZE}
    />
  )
}