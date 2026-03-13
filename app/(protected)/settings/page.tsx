import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StrangerMessageSettingsForm from '@/components/settings/stranger-message-settings-form'

export default async function SettingsPage() {
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
      allow_intro_messages,
      incoming_intro_limit_mode,
      incoming_intro_daily_limit
    `)
    .eq('id', user.id)
    .maybeSingle()

  if (error || !profile) {
    return <div className="text-red-600">Không tải được cài đặt.</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt lời nhắn từ người lạ</h1>
        <p className="mt-2 text-sm text-gray-600">
          Bạn có thể quyết định mình có nhận lời nhắn mở đầu từ người lạ hay không,
          và tối đa bao nhiêu lời nhắn mỗi ngày.
        </p>
      </div>

      <StrangerMessageSettingsForm profile={profile} />
    </div>
  )
}