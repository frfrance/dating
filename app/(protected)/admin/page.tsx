import Link from 'next/link'

const adminLinks = [
  {
    href: '/admin/users',
    title: 'Quản lý người dùng',
    description: 'Chỉnh quyền VIP, feed, ảnh feed, tin nhắn làm quen và quyền xem ai đã thích họ.',
  },
  {
    href: '/admin/feed-posts',
    title: 'Quản lý bài viết',
    description: 'Xem, ẩn và kiểm duyệt các bài viết trên feed.',
  },
  {
    href: '/admin/reports',
    title: 'Quản lý báo cáo',
    description: 'Xử lý các báo cáo người dùng và nội dung bị báo cáo.',
  },
  {
    href: '/admin/vip-requests',
    title: 'Quản lý đăng ký VIP',
    description: 'Duyệt hoặc từ chối các yêu cầu đăng ký VIP.',
  },
]

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trang quản trị</h1>
        <p className="mt-2 text-sm text-gray-600">
          Chọn khu vực bạn muốn quản lý.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {adminLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-pink-200 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}