export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Bạn đang offline</h1>
      <p className="mt-3 text-gray-600">
        Vui lòng kiểm tra lại kết nối mạng và thử lại sau.
      </p>
    </main>
  );
}