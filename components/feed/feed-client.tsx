'use client'

import { useState } from 'react'
import FeedComposer from '@/components/feed/feed-composer'
import FeedPostCard from '@/components/feed/feed-post-card'
import type { FeedPostRow } from '@/app/(protected)/feed/page'

type CurrentUser = {
  id: string
  full_name: string | null
  avatar_url: string | null
  is_vip: boolean | null
  can_create_feed_posts: boolean | null
  daily_feed_post_limit: number | null
} | null

export default function FeedClient({
  currentUser,
  initialPosts,
}: {
  currentUser: CurrentUser
  initialPosts: FeedPostRow[]
}) {
  const [posts, setPosts] = useState(initialPosts)

  function prependPost(post: FeedPostRow) {
    setPosts((prev) => [post, ...prev])
  }

  function removePost(postId: string) {
    setPosts((prev) => prev.filter((item) => item.id !== postId))
  }

  function updateCounts(postId: string, patch: Partial<FeedPostRow>) {
    setPosts((prev) =>
      prev.map((item) => (item.id === postId ? { ...item, ...patch } : item))
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Feed</h1>
        <p className="mt-2 text-sm text-gray-600">
          Chia sẻ ngắn gọn để cộng đồng có thể tương tác với bạn.
        </p>
      </div>

      <FeedComposer currentUser={currentUser} onCreated={prependPost} />

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          Chưa có bài viết nào.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              onRemoved={removePost}
              onUpdated={updateCounts}
            />
          ))}
        </div>
      )}
    </div>
  )
}