import Link from 'next/link'

const footerLinks = [
  {
    title: 'Tư vấn trọn gói bảo hiểm cho bạn và gia đình bạn',
    href: 'https://nguyenphangphap.com/versicherung/index.html',
  },
  {
    title: 'Sách Quản Trị Kinh Doanh',
    href: 'https://nguyenphangphap.com/product-category/quan-tri-kinh-doanh/',
  },
  {
    title: 'Sách Kinh Tế Thị Trường',
    href: 'https://nguyenphangphap.com/product-category/kinh-te-thi-truong/',
  },
  {
    title: 'Sách Tâm Lý Học',
    href: 'https://nguyenphangphap.com/product-category/tam-ly-hoc/',
  },
  {
    title: 'Truyện Ngôn Tình',
    href: 'https://nguyenphangphap.com/product-category/ngon-tinh/',
  },
  {
    title: 'Tài Liệu Học lái xe song ngữ đức việt',
    href: 'https://nguyenphangphap.com/tim-kiem-tai-lieu-hoc-tap/',
  },
  {
    title: 'Tìm Coupon mua sắm và mã giảm giá ở đức',
    href: 'https://nguyenphangphap.com/tim-ma-giam-gia/',
  },
  {
    title: 'Hướng dẫn sử dụng công cụ giúp anh chị săn sale ở đức',
    href: 'https://youtu.be/JQ3NPY7itSk',
  },
  {
    title: 'Công cụ săn giá vé máy bay giá rẻ',
    href: 'https://nguyenphangphap.com/kiem-tra-va-theo-gioi-gia-may-bay/',
  },
  {
    title: 'Nhắn Tin cho em',
    href: 'https://wa.me/4915147459859',
  },
]

export default function AppFooter() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Hẹn Hò Ở Châu Âu
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Kết nối cộng đồng người Việt tại châu Âu, tìm kiếm những mối quan hệ
              nghiêm túc, an toàn và phù hợp hơn với bạn.
            </p>

            <div className="mt-5 rounded-3xl border border-pink-100 bg-pink-50 p-4">
              <div className="text-sm font-semibold text-pink-700">
                Góc giới thiệu & quảng cáo
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Một số liên kết hữu ích về bảo hiểm, sách, coupon mua sắm, tài liệu học tập
                và công cụ săn vé máy bay giá rẻ.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Liên kết hữu ích
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {footerLinks.map((item) => {
                const isExternal = item.href.startsWith('http')

                if (isExternal) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"
                    >
                      {item.title}
                    </a>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"
                  >
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Hẹn Hò Ở Châu Âu. All rights reserved.</p>

          <div className="flex flex-wrap gap-4">
            <Link href="/privacy-policy" className="hover:text-pink-600">
              Chính sách bảo mật
            </Link>
            <Link href="/terms-of-service" className="hover:text-pink-600">
              Điều khoản dịch vụ
            </Link>
            <Link href="/impressum" className="hover:text-pink-600">
              Impressum
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}