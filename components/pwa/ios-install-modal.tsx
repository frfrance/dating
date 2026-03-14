"use client";

import { Share2, Plus, X } from "lucide-react";

type IosInstallModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function IosInstallModal({
  open,
  onClose,
}: IosInstallModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-3 sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-pink-100 px-4 py-4">
          <div className="pr-3">
            <h2 className="text-base font-bold text-gray-900">
              Cài ứng dụng trên iPhone/iPad
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Làm theo 3 bước rất nhanh
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4">
          <div className="rounded-2xl border border-pink-100 bg-pink-50 p-3">
            <p className="text-sm leading-6 text-gray-700">
              Sau khi thêm vào màn hình chính, web sẽ mở gần giống như một app riêng.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                <span className="text-xs font-bold">1</span>
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">
                  Bấm nút Chia sẻ
                </div>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Trong Safari, bấm{" "}
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-800">
                    <Share2 className="h-3.5 w-3.5" />
                    Chia sẻ
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                <span className="text-xs font-bold">2</span>
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">
                  Chọn Thêm vào Màn hình chính
                </div>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Chọn mục{" "}
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-800">
                    <Plus className="h-3.5 w-3.5" />
                    Thêm vào Màn hình chính
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                <span className="text-xs font-bold">3</span>
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">
                  Bấm Thêm
                </div>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Icon ứng dụng sẽ xuất hiện ngoài màn hình chính.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs leading-6 text-gray-700">
              Mẹo: hãy mở web bằng <strong>Safari</strong> để cài dễ nhất.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-pink-500 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-600"
          >
            Tôi đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}