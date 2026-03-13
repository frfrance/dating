'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.')
      return
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.session) {
        router.push('/onboarding')
        router.refresh()
        return
      }

      setSuccess('Đăng ký thành công. Hãy kiểm tra email để xác minh tài khoản.')
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignup} className="space-y-5">
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

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Xác nhận mật khẩu
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-black shadow-sm outline-none placeholder:text-gray-400 focus:border-pink-400"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-pink-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-pink-600 disabled:opacity-60"
      >
        {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
      </button>
    </form>
  )
}