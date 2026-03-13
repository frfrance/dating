import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/" className="text-sm text-neutral-600 underline">
        ← Quay lại trang chủ
      </Link>

      <h1 className="mt-6 text-4xl font-bold">Giới thiệu về HerzMatch tại Đức</h1>

      <div className="mt-6 space-y-5 text-neutral-700">
        <p>
          HerzMatch là nền tảng hẹn hò hiện đại dành cho những người đang sống tại Đức
          và muốn tìm kiếm những mối quan hệ nghiêm túc, chân thành hoặc những kết nối
          mới có ý nghĩa.
        </p>

        <p>
          Ứng dụng tập trung vào trải nghiệm trực quan, dễ dùng trên điện thoại, máy tính
          bảng và máy tính. Người dùng có thể khám phá hồ sơ, quẹt trái quẹt phải, trò
          chuyện sau khi match và tìm kiếm theo thành phố hoặc quốc gia.
        </p>

        <p>
          Chúng tôi ưu tiên ba giá trị quan trọng: ẩn danh, bảo mật và tin cậy. Người dùng
          có quyền kiểm soát hồ sơ của mình, có thể chặn, báo cáo tài khoản không phù hợp
          và sử dụng hệ thống nhắn tin an toàn.
        </p>
      </div>
    </main>
  )
}