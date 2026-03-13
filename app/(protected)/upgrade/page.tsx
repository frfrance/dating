import Link from 'next/link'

export default function UpgradePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-pink-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Nâng cấp lên VIP</h1>
        <p className="mt-3 text-gray-600">
          Mở khóa tính năng cao cấp và tận hưởng trải nghiệm tốt nhất trên Hẹn Hò Ở Châu Âu.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Hàng tháng</div>
            <div className="mt-3 text-4xl font-bold text-gray-900">9,99€</div>
            <div className="mt-2 text-sm text-gray-500">Hủy bất kỳ lúc nào</div>
          </div>

          <div className="relative rounded-3xl border-2 border-pink-500 bg-pink-50 p-6 shadow-sm">
            <div className="absolute -top-3 left-5 rounded-full bg-pink-500 px-3 py-1 text-xs font-semibold text-white">
              Phổ biến nhất
            </div>

            <div className="text-sm font-medium text-pink-700">Hàng năm</div>
            <div className="mt-3 text-4xl font-bold text-gray-900">42€</div>
            <div className="mt-2 text-sm text-gray-600">VIP trong 12 tháng</div>
            <div className="mt-1 text-sm font-medium text-pink-700">Tiết kiệm 65%</div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 p-6">
          <ul className="space-y-3 text-sm text-gray-700">
            <li>• Lượt thích không giới hạn</li>
            <li>• Nhiều yêu cầu nhắn tin hơn mỗi ngày</li>
            <li>• Xem ai đã thích bạn</li>
            <li>• Nhiều lượt hoàn tác hơn mỗi ngày</li>
          </ul>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button className="rounded-2xl bg-pink-500 px-5 py-3 font-semibold text-white hover:bg-pink-600">
            Nâng cấp VIP
          </button>

          <Link
            href="/connect"
            className="flex items-center justify-center rounded-2xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Để sau
          </Link>
        </div>
      </div>
    </div>
  )
}