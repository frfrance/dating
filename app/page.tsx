import Link from 'next/link'
import Image from 'next/image'
const features = [
  {
    title: 'Không Lộ Liên Kết Mạng Xã Hội',
    description:
      'Đối phương sẽ không biết các liên kết mạng xã hội của bạn, trong trường hợp bạn không mong muốn lâu dài.',
  },
  {
    title: 'Nhắn tin an toàn',
    description:
      'Bạn có quyền từ chối các tin nhắn nhạy cảm hoặc đối tác không mong muốn. Mã hoá 2 đầu, chỉ riêng bạn và đối tác biết nội dung tin nhắn.',
  },
  {
    title: 'Tìm theo thành phố và quốc gia',
    description:
      'Dễ dàng tìm người phù hợp tại Berlin, Munich, Hamburg hoặc bất kỳ đâu tại Đức hoặc trong Liên Minh Châu Âu.',
  },
]

const safetyItems = [
  {
    title: 'Ẩn danh',
    description:
      'Bạn có thể dùng tên hiển thị thay vì tên thật và kiểm soát lượng thông tin công khai.',
  },
  {
    title: 'Bảo mật',
    description:
      'Thông tin cá nhân, hình ảnh và tin nhắn được quản lý an toàn với hệ thống xác thực rõ ràng.',
  },
  {
    title: 'Tin cậy',
    description:
      'Hồ sơ đầy đủ, cơ chế báo cáo và chặn tài khoản giúp cộng đồng lành mạnh hơn.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <section className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/discover" className="flex items-center">
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={36}
            height={36}
            className="rounded-md"
          />
        </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/about" className="text-sm text-neutral-600 hover:text-black">
              Giới thiệu
            </Link>
            <Link href="/login" className="text-sm text-neutral-600 hover:text-black">
              Đăng nhập
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Bắt đầu
            </Link>
          </nav>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col justify-center">
          <span className="mb-4 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium text-neutral-600">
            Hẹn Hò Tại Châu Âu
          </span>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Ẩnh Danh, Tin Nhắn Mã Hoá 2 Chiều. Bộ Lọc Và Các Công Cụ Tuyệt Vời Khác
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
            Hẹn Hò Ở Châu Âu giúp bạn gặp gỡ những người phù hợp theo thành phố, quốc gia,
            độ tuổi và sở thích. Giao diện hiện đại, phong cách trực quan như mạng
            xã hội, nhưng tập trung vào kết nối thật và sự tin cậy.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
            >
              Tạo tài khoản
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-medium"
            >
              Đăng nhập
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-neutral-600">
            <span className="rounded-full bg-neutral-100 px-3 py-1">Berlin</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1">Munich</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1">Hamburg</span>
            <span className="rounded-full bg-neutral-100 px-3 py-1">Cologne</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border bg-neutral-50 p-4 shadow-sm">
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-pink-200 via-rose-100 to-white" />
              <div className="mt-4">
                <h3 className="font-semibold">Dung, 27</h3>
                <p className="mt-1 text-sm text-neutral-600">Berlin · Art · Coffee · Travel</p>
              </div>
            </div>

            <div className="rounded-3xl border bg-neutral-50 p-4 shadow-sm sm:translate-y-8">
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-purple-200 via-fuchsia-100 to-white" />
              <div className="mt-4">
                <h3 className="font-semibold">Tuấn, 30</h3>
                <p className="mt-1 text-sm text-neutral-600">Munich · Fitness · Music · Weekend Trips</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold sm:text-3xl">Tính năng chính</h2>
          <p className="mt-2 text-neutral-600">
            Tính năng giúp bạn bảo vệ an toàn trên mạng xã hội, hoàn toàn ẩn danh. Bạn không cần cung cấp các thông tin nhạy cảm cho đối tác.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="rounded-3xl border p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Ẩn danh, bảo mật, tin cậy</h2>
            <p className="mt-2 text-neutral-600">
              Henho.eu là 1 trong những nền tảng có số lượng người sử dụng lớn tại Châu Âu. Bao gồm các đất nước như Đức, Pháp, Thuỵ Sĩ, ...
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {safetyItems.map((item) => (
              <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-black px-6 py-10 text-white sm:px-10">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Sẵn sàng bắt đầu hành trình kết nối?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
            Tạo tài khoản, hoàn thiện hồ sơ, thêm ảnh đại diện và bắt đầu khám phá
            những người phù hợp với bạn.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
            >
              Đăng ký miễn phí
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white"
            >
              Tôi đã có tài khoản
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-neutral-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 henho.eu Hẹn Hò Tại Châu Âu.</p>
          <div className="flex gap-4">
            <Link href="/about">Giới thiệu</Link>
            <Link href="/login">Đăng nhập</Link>
            <Link href="/signup">Đăng ký</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}