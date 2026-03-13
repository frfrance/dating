export default function ReportIssuePage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Báo cáo sự cố
        </h1>

        <div className="mt-8 space-y-6 text-gray-700">
          <p className="leading-7">
            Nếu bạn gặp lỗi trong quá trình sử dụng, vui lòng gửi mô tả chi tiết về sự cố,
            thời điểm xảy ra lỗi và ảnh chụp màn hình nếu có.
          </p>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="text-sm font-medium text-gray-500">Email hỗ trợ</div>
            <div className="mt-2 text-lg font-semibold text-gray-900">
              dautuoduc@gmail.com
            </div>
          </div>

          <p className="leading-7">
            Bạn có thể gửi email với tiêu đề ví dụ như:
            <span className="ml-1 font-medium text-gray-900">
              “Báo cáo lỗi đăng nhập” hoặc “Lỗi gửi tin nhắn”
            </span>
            .
          </p>
        </div>
      </div>
    </main>
  )
}