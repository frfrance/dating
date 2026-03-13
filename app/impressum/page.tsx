export default function ImpressumPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Impressum
        </h1>

        <div className="mt-8 space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900">Tên đơn vị</h2>
            <p className="mt-3 leading-7">LumiViet (sẽ cập nhật)</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Địa chỉ</h2>
            <p className="mt-3 leading-7">Địa chỉ (sẽ cập nhật)</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Email liên hệ</h2>
            <p className="mt-3 leading-7">dautuoduc@gmail.com</p>
          </section>

          <section>
            <p className="leading-7">
              Theo quy định pháp luật Đức, chúng tôi cung cấp thông tin liên hệ trên đây.
              Nếu có thắc mắc, vui lòng liên hệ qua email.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}