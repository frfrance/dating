import Link from 'next/link'

type ProfileCompletionBannerProps = {
  percentage: number
  remaining: number
}

export default function ProfileCompletionBanner({
  percentage,
}: ProfileCompletionBannerProps) {
  if (percentage >= 100) return null

  return (
    <div className="mb-6 rounded-3xl border border-pink-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900">
            Hồ sơ của bạn đã hoàn thiện {percentage}%
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Bạn hoàn thiện càng chi tiết thì tỷ lệ match càng cao.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="text-sm font-semibold text-pink-600">{percentage}%</div>

          <Link
            href="/profile/edit"
            className="inline-flex items-center justify-center rounded-2xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-600"
          >
            Bổ sung thêm thông tin ngay
          </Link>
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-pink-100">
        <div
          className="h-full rounded-full bg-pink-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}