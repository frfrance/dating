import { redirect } from 'next/navigation'
import DiscoverClient, {
  type DiscoverProfile,
} from '@/components/discover/discover-client'
import { createClient } from '@/lib/supabase/server'

export default async function DiscoverPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  const { data, error } = await supabase.rpc('get_discover_profiles', {
    p_user_id: user.id,
  })

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        Không tải được danh sách khám phá: {error.message}
      </div>
    )
  }

  return <DiscoverClient initialProfiles={(data || []) as DiscoverProfile[]} />
}