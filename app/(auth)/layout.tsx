import Image from 'next/image'
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-pink-100 bg-white shadow-xl md:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-pink-50 via-white to-orange-50 p-10 md:flex md:flex-col md:justify-between">
            <div>
              <Image
    src="/favicon.ico"
    alt="Logo"
    width={36}
    height={36}
    className="rounded-md"
  />


              <h2 className="mt-6 text-4xl font-bold leading-tight text-gray-900">
                Kết nối thật,
                <br />
                trò chuyện an toàn,
                <br />
                gặp đúng người.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-gray-600">
                Tạo hồ sơ hẹn hò hiện đại với phong cách sáng, nhẹ nhàng và thân thiện
                như một ứng dụng thật.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-pink-100 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">Riêng tư</div>
                <div className="mt-1 text-sm text-gray-500">
                  Dữ liệu được kiểm soát an toàn.
                </div>
              </div>

              <div className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-gray-900">Kết nối thật</div>
                <div className="mt-1 text-sm text-gray-500">
                  Match đúng tiêu chí của bạn.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-10">{children}</div>
        </div>
      </div>
    </div>
  )
}