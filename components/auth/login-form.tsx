'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu.')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/discover')
      router.refresh()
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')

    try {
      setGoogleLoading(true)

      const origin = window.location.origin

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=/discover`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch {
      setError('Không thể đăng nhập bằng Google. Vui lòng thử lại.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@example.com"
            className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-pink-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-pink-400"
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full rounded-2xl bg-pink-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-pink-600 disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-500">hoặc</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || googleLoading}
        className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
      >
        {googleLoading ? 'Đang chuyển sang Google...' : 'Tiếp tục với Google'}
      </button>
    </div>
  )
}