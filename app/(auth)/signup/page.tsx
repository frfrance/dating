import Link from 'next/link'
import SignupForm from '@/components/auth/signup-form'

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md">
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full bg-pink-100 px-4 py-2 text-sm font-medium text-pink-700">
          Bắt đầu miễn phí
        </div>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">Đăng ký</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tạo tài khoản để hoàn thiện hồ sơ và bắt đầu khám phá.
        </p>
      </div>

      <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <SignupForm />

        <p className="mt-5 text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-medium text-pink-600 hover:text-pink-700">
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  )
}