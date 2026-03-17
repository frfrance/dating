import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminUserOutgoingIntroTable from '@/components/admin/admin-user-outgoing-intro-table'

const PAGE_SIZE = 20

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams

  const rawKeyword = resolvedSearchParams.q || ''
  const keyword = rawKeyword.trim()

  const pageParam = Number(resolvedSearchParams.page || '1')
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1

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

  let countQuery = supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (keyword) {
    countQuery = countQuery.or(`full_name.ilike.%${keyword}%,email.ilike.%${keyword}%`)
  }

  const { count, error: countError } = await countQuery

  if (countError) {
    return <div className="text-red-600">Không tải được tổng số người dùng.</div>
  }

  const totalUsers = Number(count || 0)
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const safeFrom = (safeCurrentPage - 1) * PAGE_SIZE
  const safeTo = safeFrom + PAGE_SIZE - 1

  let usersQuery = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      outgoing_intro_limit_mode,
      outgoing_intro_daily_limit,
      allow_intro_messages,
      can_see_who_likes_me,
      is_admin,
      is_vip,
      is_verified_member,
      can_create_feed_posts,
      daily_feed_post_limit,
      can_upload_feed_images
    `)
    .order('created_at', { ascending: false })
    .range(safeFrom, safeTo)

  if (keyword) {
    usersQuery = usersQuery.or(`full_name.ilike.%${keyword}%,email.ilike.%${keyword}%`)
  }

  const { data: users, error } = await usersQuery

  if (error) {
    return <div className="text-red-600">Không tải được danh sách user.</div>
  }

  const prevPage = safeCurrentPage > 1 ? safeCurrentPage - 1 : null
  const nextPage = safeCurrentPage < totalPages ? safeCurrentPage + 1 : null

  const pageHref = (page: number) => {
    if (keyword) {
      return `/admin/users?page=${page}&q=${encodeURIComponent(keyword)}`
    }

    return `/admin/users?page=${page}`
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <AdminUserOutgoingIntroTable
        users={users || []}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        totalUsers={totalUsers}
        pageSize={PAGE_SIZE}
        initialSearch={keyword}
      />

      <div className="mt-6 flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Trang <strong>{safeCurrentPage}</strong> / <strong>{totalPages}</strong> · Tổng{' '}
          <strong>{totalUsers}</strong> người dùng
          {keyword ? (
            <>
              {' '}
              · Kết quả cho <strong>&quot;{keyword}&quot;</strong>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {prevPage ? (
            <Link
              href={pageHref(prevPage)}
              className="rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Trang trước
            </Link>
          ) : (
            <span className="rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-400">
              ← Trang trước
            </span>
          )}

          {nextPage ? (
            <Link
              href={pageHref(nextPage)}
              className="rounded-2xl bg-pink-500 px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
            >
              Trang sau →
            </Link>
          ) : (
            <span className="rounded-2xl border border-gray-200 px-4 py-2 text-sm text-gray-400">
              Trang sau →
            </span>
          )}
        </div>
      </div>
    </main>
  )
}