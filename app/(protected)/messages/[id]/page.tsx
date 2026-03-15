import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatThread from '@/components/messages/chat-thread'
import ChatUserActions from '@/components/messages/chat-user-actions'
import VipBadge from '@/components/profile/vip-badge'

type OtherUserRow = {
  other_user_id: string
  other_user_full_name: string | null
  other_user_avatar_url: string | null
  other_user_is_vip?: boolean | null
}

export default async function MessageThreadPage({
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

  const { data: membership } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('conversation_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) {
    redirect('/messages')
  }

  const { data: otherUserData, error: otherUserError } = await supabase.rpc(
    'get_conversation_other_user',
    {
      p_conversation_id: id,
    }
  )

  if (otherUserError) {
    return <div className="text-red-600">Không tải được người nhận tin nhắn.</div>
  }

  const otherUser = Array.isArray(otherUserData)
    ? (otherUserData[0] as OtherUserRow | undefined)
    : undefined

  if (!otherUser) {
    redirect('/messages')
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, content, is_seen, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    return <div className="text-red-600">Không tải được tin nhắn.</div>
  }

  const displayName =
    otherUser?.other_user_full_name?.trim() || 'Người dùng chưa cập nhật tên'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
        <ChatUserActions
          otherUserId={otherUser.other_user_id}
          otherUserName={displayName}
          otherUserAvatarUrl={otherUser.other_user_avatar_url}
        />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold text-gray-900">{displayName}</div>
            <VipBadge isVip={otherUser.other_user_is_vip} />
          </div>
          <div className="text-sm text-gray-500">Cuộc trò chuyện riêng tư</div>
        </div>
      </div>

      <ChatThread
        conversationId={id}
        currentUserId={user.id}
        initialMessages={messages || []}
      />
    </div>
  )
}