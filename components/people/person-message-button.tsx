'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import IntroMessageModal from '@/components/discover/intro-message-modal'

export default function PersonMessageButton({
  targetUserId,
  targetUserName,
  existingConversationId,
}: {
  targetUserId: string
  targetUserName: string
  existingConversationId: string | null
}) {
  const [open, setOpen] = useState(false)

  if (existingConversationId) {
    return (
      <Link
        href={`/messages/${existingConversationId}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-500 px-4 py-3 font-medium text-white hover:bg-pink-600"
      >
        <MessageCircle className="h-4 w-4" />
        Nhắn tin
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-500 px-4 py-3 font-medium text-white hover:bg-pink-600"
      >
        <MessageCircle className="h-4 w-4" />
        Nhắn tin
      </button>

      <IntroMessageModal
        targetUserId={targetUserId}
        targetUserName={targetUserName}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}