'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Flag, Heart, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import VipBadge from '@/components/profile/vip-badge'
import type { FeedPostRow } from '@/app/(protected)/feed/page'
import { formatGermanDateTime } from '@/lib/date-format'

function containsBlockedContactInfo(text: string) {
  const value = text.toLowerCase()

  const hasLink =
    /https?:\/\//i.test(value) ||
    /www\./i.test(value) ||
    /\b(t\.me|telegram|zalo|facebook\.com|fb\.com|instagram\.com)\b/i.test(value)

  const hasEmail =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(value)

  const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(value)

  return hasLink || hasEmail || hasPhone
}

type CommentProfile = {
  full_name: string | null
  avatar_url: string | null
  is_vip: boolean | null
}

type CommentRow = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles: CommentProfile | null
}

type RawCommentRow = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles: CommentProfile[] | null
}

export default function FeedPostCard({
  post,
  onRemoved,
  onUpdated,
}: {
  post: FeedPostRow
  onRemoved: (postId: string) => void
  onUpdated: (postId: string, patch: Partial<FeedPostRow>) => void
}) {
  const supabase = createClient()
  const [liked, setLiked] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [commentText, setCommentText] = useState('')
  const [loadingComment, setLoadingComment] = useState(false)
  const [loadingReport, setLoadingReport] = useState(false)
  const [error, setError] = useState('')

  const formattedCreatedAt = useMemo(
    () => formatGermanDateTime(post.created_at),
    [post.created_at]
  )

  async function loadComments() {
    const { data, error } = await supabase
      .from('feed_post_comments')
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        profiles!feed_post_comments_user_id_fkey (
          full_name,
          avatar_url,
          is_vip
        )
      `)
      .eq('post_id', post.id)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
      return
    }

    const mappedComments: CommentRow[] = ((data || []) as RawCommentRow[]).map((item) => ({
      id: item.id,
      post_id: item.post_id,
      user_id: item.user_id,
      content: item.content,
      created_at: item.created_at,
      profiles: item.profiles?.[0]
        ? {
            full_name: item.profiles[0].full_name,
            avatar_url: item.profiles[0].avatar_url,
            is_vip: item.profiles[0].is_vip,
          }
        : null,
    }))

    setComments(mappedComments)
  }

  async function handleToggleLike() {
    const { data, error } = await supabase.rpc('toggle_feed_post_like', {
      p_post_id: post.id,
    })

    if (error) {
      setError(error.message)
      return
    }

    const nextLiked = Boolean(data)
    setLiked(nextLiked)

    onUpdated(post.id, {
      like_count: nextLiked ? post.like_count + 1 : Math.max(0, post.like_count - 1),
    })
  }

  async function handleCommentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!commentText.trim()) {
      setError('Vui lòng nhập bình luận.')
      return
    }

    if (containsBlockedContactInfo(commentText)) {
      setError('Bình luận không được chứa số điện thoại, email hoặc link.')
      return
    }

    try {
      setLoadingComment(true)

      const { error } = await supabase.rpc('create_feed_comment', {
        p_post_id: post.id,
        p_content: commentText.trim(),
      })

      if (error) {
        throw new Error(error.message)
      }

      setCommentText('')
      await loadComments()

      onUpdated(post.id, {
        comment_count: post.comment_count + 1,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra.'
      setError(message)
    } finally {
      setLoadingComment(false)
    }
  }

  async function handleReport() {
    try {
      setLoadingReport(true)
      setError('')

      const { error } = await supabase.rpc('report_feed_post', {
        p_post_id: post.id,
      })

      if (error) {
        throw new Error(error.message)
      }

      onRemoved(post.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra.'
      setError(message)
    } finally {
      setLoadingReport(false)
    }
  }

  async function toggleComments() {
    const next = !commentOpen
    setCommentOpen(next)

    if (next) {
      await loadComments()
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-pink-100">
            {post.user_avatar_url ? (
              <img
                src={post.user_avatar_url}
                alt={post.user_full_name || 'Avatar'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-pink-700">
                {(post.user_full_name || 'U').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/people/${post.user_id}`}
                className="font-semibold text-gray-900 hover:text-pink-600"
              >
                {post.user_full_name || 'Người dùng'}
              </Link>
              <VipBadge isVip={post.user_is_vip} />
            </div>
            <div className="text-sm text-gray-500">{formattedCreatedAt}</div>
          </div>
        </div>

        <div className="mt-4 whitespace-pre-wrap text-gray-800">{post.content}</div>
      </div>

      {post.image_url ? (
        <div className="border-y border-gray-100 bg-gray-50">
          <img
            src={post.image_url}
            alt="Ảnh bài viết"
            className="max-h-[560px] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="px-5 py-3 text-sm text-gray-500">
        {post.like_count} lượt thích · {post.comment_count} bình luận
      </div>

      <div className="grid grid-cols-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleToggleLike}
          className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Heart className="h-4 w-4" />
          Thích
        </button>

        <button
          type="button"
          onClick={toggleComments}
          className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>

        <button
          type="button"
          onClick={handleReport}
          disabled={loadingReport}
          className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <Flag className="h-4 w-4" />
          Báo cáo
        </button>
      </div>

      {error ? (
        <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {commentOpen ? (
        <div className="border-t border-gray-100 p-5">
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              className="min-h-24 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black outline-none"
            />
            <button
              type="submit"
              disabled={loadingComment}
              className="rounded-2xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-600 disabled:opacity-60"
            >
              {loadingComment ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </form>

          <div className="mt-4 space-y-3">
            {comments.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
                Chưa có bình luận nào.
              </div>
            ) : null}

            {comments.map((comment) => {
              const commentName = comment.profiles?.full_name || 'Người dùng'
              const commentAvatar = comment.profiles?.avatar_url || null

              return (
                <div key={comment.id} className="rounded-2xl bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <Link
                      href={`/people/${comment.user_id}`}
                      className="h-10 w-10 overflow-hidden rounded-full bg-pink-100"
                    >
                      {commentAvatar ? (
                        <img
                          src={commentAvatar}
                          alt={commentName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-pink-700">
                          {commentName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/people/${comment.user_id}`}
                          className="font-medium text-gray-900 hover:text-pink-600"
                        >
                          {commentName}
                        </Link>
                        <VipBadge isVip={comment.profiles?.is_vip} />
                      </div>

                      <div className="mt-1 text-sm text-gray-700">{comment.content}</div>

                      <div className="mt-2 text-xs text-gray-500">
                        {formatGermanDateTime(comment.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}