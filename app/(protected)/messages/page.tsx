import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MessagesInboxClient from '@/components/messages/messages-inbox-client'

type InboxRow = {
  conversation_id: string
  other_user_id: string
  other_user_full_name: string | null
  other_user_avatar_url: string | null
  other_user_is_vip?: boolean | null
  last_message: string | null
  last_message_at: string | null
}

type PendingIntro = {
  request_id: string
  initiator_id: string
  initiator_full_name: string | null
  initiator_avatar_url: string | null
  initiator_is_vip?: boolean | null
  content: string
  created_at: string
}

const ADMIN_SUPPORT_USER_ID = '4db1ed64-15a7-4643-b6d6-8b1b0ec67425'

export default async function MessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (user.id !== ADMIN_SUPPORT_USER_ID) {
    await supabase.rpc('ensure_admin_support_conversation', {
      p_user_id: user.id,
      p_admin_user_id: ADMIN_SUPPORT_USER_ID,
    })
  }

  const { data: inboxData, error: inboxError } = await supabase.rpc(
    'get_inbox_conversations'
  )

  if (inboxError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được danh sách hội thoại: {inboxError.message}
      </div>
    )
  }

  const { data: pendingData, error: pendingError } = await supabase.rpc(
    'get_pending_intro_requests'
  )

  if (pendingError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được yêu cầu trò chuyện: {pendingError.message}
      </div>
    )
  }

  return (
    <MessagesInboxClient
      initialConversations={(inboxData || []) as InboxRow[]}
      initialPendingRequests={(pendingData || []) as PendingIntro[]}
    />
  )
}