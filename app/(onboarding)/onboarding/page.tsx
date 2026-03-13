import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingForm from '@/components/onboarding/onboarding-form'

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      onboarding_completed,
      full_name,
      birth_date,
      gender,
      looking_for,
      bio,
      city,
      country,
      country_code,
      search_country,
      search_country_code,
      search_city,
      search_mode,
      first_date_idea,
      weekend_habit,
      interests,
      avatar_url,
      preferred_age_min,
      preferred_age_max
    `)
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
        <p className="text-red-600">Không tải được hồ sơ: {error.message}</p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
        <p className="text-red-600">Không tìm thấy profile.</p>
      </main>
    )
  }

  if (profile.onboarding_completed) {
    redirect('/profile')
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        
      </div>

      <OnboardingForm profile={profile} />
    </main>
  )
}