import Link from 'next/link'
import LoginForm from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md">
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700">
          Chào mừng quay trở lại
        </div>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">Đăng nhập</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tiếp tục hành trình kết nối và trò chuyện của bạn.
        </p>
      </div>

      <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <LoginForm />

        <p className="mt-5 text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link href="/signup" className="font-medium text-pink-600 hover:text-pink-700">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </main>
  )
}