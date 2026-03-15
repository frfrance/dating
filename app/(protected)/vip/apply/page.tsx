import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VipApplyForm from '@/components/vip/vip-apply-form'

export default async function VipApplyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, is_vip, is_verified_member')
    .eq('id', user.id)
    .maybeSingle()

  const { data: existingRequest } = await supabase
    .from('vip_requests')
    .select(`
      id,
      phone_number,
      facebook_link,
      face_image_url,
      face_image_storage_path,
      status,
      admin_note
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Đăng ký VIP</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Gửi thông tin để admin duyệt tài khoản VIP.
          </p>
        </div>

        <VipApplyForm
          userId={user.id}
          isVip={profile?.is_vip ?? false}
          isVerifiedMember={profile?.is_verified_member ?? false}
          existingRequest={existingRequest ?? null}
        />
      </div>
    </main>
  )
}