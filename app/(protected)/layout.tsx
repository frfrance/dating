import { redirect } from 'next/navigation'
import AppFooter from '@/components/layout/app-footer'
import { createClient } from '@/lib/supabase/server'
import AppHeader from '@/components/layout/app-header'
import ProfileCompletionBanner from '@/components/profile/profile-completion-banner'
import { computeProfileCompletion } from '@/lib/profile-completion'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      full_name,
      birth_date,
      gender,
      looking_for,
      bio,
      city,
      country,
      search_country,
      search_mode,
      first_date_idea,
      weekend_habit,
      interests,
      avatar_url,
      preferred_age_min,
      preferred_age_max,
      extra_profile_data
    `)
    .eq('id', user.id)
    .maybeSingle()

  const completion = profile
    ? computeProfileCompletion(profile)
    : { percentage: 0, remaining: 0 }

  return (
  <div className="min-h-screen bg-[#fafafa]">
    <AppHeader />
    <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
      <ProfileCompletionBanner
        percentage={completion.percentage}
        remaining={completion.remaining}
      />
      {children}
    </main>
    <AppFooter />
  </div>
)
}