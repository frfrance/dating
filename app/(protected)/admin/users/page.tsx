import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminUserOutgoingIntroTable from '@/components/admin/admin-user-outgoing-intro-table'

export default async function AdminUsersPage() {
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

  if (!me?.is_admin) {
    redirect('/discover')
  }

  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      outgoing_intro_limit_mode,
      outgoing_intro_daily_limit,
      allow_intro_messages,
      can_see_who_likes_me,
      is_admin
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="text-red-600">Không tải được danh sách user.</div>
  }

  return <AdminUserOutgoingIntroTable users={users || []} />
}