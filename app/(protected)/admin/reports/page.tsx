import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type ReportRow = {
  report_id: string
  reporter_id: string
  reporter_name: string | null
  reporter_email: string | null
  reported_user_id: string
  reported_user_name: string | null
  reported_user_email: string | null
  reason: string
  details: string | null
  created_at: string
}

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: me } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!me?.is_admin) {
    redirect('/discover')
  }

  const { data, error } = await supabase.rpc('get_admin_reports')

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được danh sách báo cáo: {error.message}
      </div>
    )
  }

  const reports = (data || []) as ReportRow[]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo người dùng</h1>
        <p className="mt-2 text-sm text-gray-600">
          Danh sách các báo cáo do người dùng gửi lên.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          Hiện chưa có báo cáo nào.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.report_id}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-gray-500">Người báo cáo</div>
                  <div className="mt-2 text-lg font-semibold text-gray-900">
                    {report.reporter_name || 'Chưa cập nhật tên'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {report.reporter_email || 'Không có email'}
                  </div>

                  <Link
                    href={`/people/${report.reporter_id}`}
                    className="mt-3 inline-block text-sm font-medium text-pink-600 hover:text-pink-700"
                  >
                    Xem profile người báo cáo
                  </Link>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500">Người bị báo cáo</div>
                  <div className="mt-2 text-lg font-semibold text-gray-900">
                    {report.reported_user_name || 'Chưa cập nhật tên'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {report.reported_user_email || 'Không có email'}
                  </div>

                  <Link
                    href={`/people/${report.reported_user_id}`}
                    className="mt-3 inline-block text-sm font-medium text-pink-600 hover:text-pink-700"
                  >
                    Xem profile người bị báo cáo
                  </Link>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-sm font-medium text-gray-500">Lý do báo cáo</div>
                <div className="mt-1 text-base font-semibold text-gray-900">
                  {report.reason}
                </div>

                <div className="mt-4 text-sm font-medium text-gray-500">
                  Mô tả thêm
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  {report.details?.trim() || 'Không có mô tả thêm.'}
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-400">
                Gửi lúc {new Date(report.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}