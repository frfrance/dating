import ChangePasswordForm from '@/components/auth/change-password-form'

export default function ChangePasswordPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Đổi mật khẩu
        </h1>
        <p className="mt-3 text-gray-600">
          Cập nhật mật khẩu mới để bảo vệ tài khoản của bạn.
        </p>

        <div className="mt-8">
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  )
}