import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
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

  const headerStore = await headers()
  const pathname =
    headerStore.get('x-pathname') ||
    headerStore.get('next-url') ||
    ''

  const isAdminRoute = pathname.startsWith('/admin')
  const isOnboardingRoute = pathname === '/onboarding'

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      id,
      is_admin,
      onboarding_completed,
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

  if (!profile) {
    redirect('/login')
  }

  const isAdmin = !!profile.is_admin
  const onboardingCompleted = !!profile.onboarding_completed

  if (!isAdmin && !onboardingCompleted && !isOnboardingRoute) {
    redirect('/onboarding')
  }

  if (isAdminRoute) {
    return <>{children}</>
  }

  const completion = computeProfileCompletion(profile)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
        {onboardingCompleted ? (
          <ProfileCompletionBanner
            percentage={completion.percentage}
            remaining={completion.remaining}
          />
        ) : null}

        {children}
      </main>
      <AppFooter />
    </div>
  )
}