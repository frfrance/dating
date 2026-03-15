'use client'

import { useCallback, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DiscoverCard, {
  type DiscoverProfile,
} from '@/components/discover/discover-card'

export default function DiscoverClient({
  initialProfiles,
  currentUserIsVip,
}: {
  initialProfiles: DiscoverProfile[]
  currentUserIsVip: boolean
}) {
  const supabase = createClient()

  const [mode, setMode] = useState<'discover' | 'passed'>('discover')
  const [profiles, setProfiles] = useState<DiscoverProfile[]>(initialProfiles)
  const [passedProfiles, setPassedProfiles] = useState<DiscoverProfile[]>([])
  const [loadingPassed, setLoadingPassed] = useState(false)
  const [error, setError] = useState('')

  const currentProfile = useMemo(() => {
    return mode === 'discover' ? profiles[0] || null : passedProfiles[0] || null
  }, [mode, profiles, passedProfiles])

  const handleRemoved = useCallback(
    (profileId: string, _matched: boolean, _conversationId?: string | null) => {
      if (mode === 'discover') {
        setProfiles((prev) => prev.filter((item) => item.id !== profileId))
      } else {
        setPassedProfiles((prev) => prev.filter((item) => item.id !== profileId))
      }
    },
    [mode]
  )

  async function loadPassedProfiles() {
    try {
      setLoadingPassed(true)
      setError('')

      const { data, error } = await supabase.rpc('get_passed_profiles')

      if (error) {
        setError(error.message)
        return
      }

      setPassedProfiles((data || []) as DiscoverProfile[])
    } finally {
      setLoadingPassed(false)
    }
  }

  async function switchMode(nextMode: 'discover' | 'passed') {
    setError('')
    setMode(nextMode)

    if (nextMode === 'passed' && currentUserIsVip && passedProfiles.length === 0) {
      await loadPassedProfiles()
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Khám phá</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tìm người phù hợp với bạn và bắt đầu kết nối.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => switchMode('discover')}
          className={[
            'rounded-full px-4 py-2 text-sm font-medium transition',
            mode === 'discover'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-pink-50',
          ].join(' ')}
        >
          Khám phá
        </button>

        {currentUserIsVip ? (
          <button
            type="button"
            onClick={() => switchMode('passed')}
            className={[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              mode === 'passed'
                ? 'bg-pink-500 text-white shadow-sm'
                : 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-pink-50',
            ].join(' ')}
          >
            Xem lại người đã từ chối
          </button>
        ) : (
          <div className="rounded-full bg-yellow-50 px-4 py-2 text-sm text-yellow-700 ring-1 ring-yellow-200">
            Tính năng xem lại người đã từ chối chỉ dành cho VIP
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {loadingPassed ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          Đang tải danh sách đã từ chối...
        </div>
      ) : null}

      {!loadingPassed && !currentProfile ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
          {mode === 'discover'
            ? 'Hiện chưa còn hồ sơ nào để khám phá.'
            : 'Bạn chưa từ chối ai hoặc danh sách này hiện đang trống.'}
        </div>
      ) : null}

      {!loadingPassed && currentProfile ? (
        <DiscoverCard profile={currentProfile} onRemoved={handleRemoved} />
      ) : null}
    </div>
  )
}