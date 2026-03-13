'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_seen: boolean
  created_at: string
}

export default function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
}) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  async function markSeen() {
    await supabase
      .from('messages')
      .update({ is_seen: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .eq('is_seen', false)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    markSeen()

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })

          if (newMessage.sender_id !== currentUserId) {
            await markSeen()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId])

  async function handleSendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const trimmed = content.trim()
    if (!trimmed) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: trimmed,
        })
        .select('id, conversation_id, sender_id, content, is_seen, created_at')
        .single()

      if (error) {
        setError(error.message)
        return
      }

      setMessages((prev) => {
        if (prev.some((msg) => msg.id === data.id)) return prev
        return [...prev, data]
      })
      setContent('')
    } catch {
      setError('Không gửi được tin nhắn.')
    } finally {
      setLoading(false)
    }
  }

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [messages]
  )

  return (
    <div className="flex h-[75vh] flex-col rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Cuộc trò chuyện</h2>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {sortedMessages.map((message) => {
          const isMine = message.sender_id === currentUserId

          return (
            <div
              key={message.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={[
                  'max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-sm',
                  isMine ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-800',
                ].join(' ')}
              >
                <div>{message.content}</div>
                <div
                  className={[
                    'mt-1 text-[11px]',
                    isMine ? 'text-pink-100' : 'text-gray-400',
                  ].join(' ')}
                >
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        {error ? (
          <div className="mb-3 rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <div className="flex gap-3">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="h-12 flex-1 rounded-2xl border border-gray-300 px-4 text-black outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-pink-500 px-5 py-3 font-medium text-white hover:bg-pink-600 disabled:opacity-60"
          >
            Gửi
          </button>
        </div>
      </form>
    </div>
  )
}