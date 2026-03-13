import { EXTRA_PROFILE_FIELDS } from './profile-extra-fields'

type ProfileLike = {
  full_name?: string | null
  birth_date?: string | null
  gender?: string | null
  looking_for?: string[] | null
  bio?: string | null
  city?: string | null
  country?: string | null
  search_country?: string | null
  search_mode?: string | null
  first_date_idea?: string | null
  weekend_habit?: string | null
  interests?: string[] | null
  avatar_url?: string | null
  preferred_age_min?: number | null
  preferred_age_max?: number | null
  extra_profile_data?: Record<string, unknown> | null
}

function isFilled(value: unknown) {
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

export function computeProfileCompletion(profile: ProfileLike) {
  const coreChecks = [
    isFilled(profile.full_name),
    isFilled(profile.birth_date),
    isFilled(profile.gender),
    isFilled(profile.looking_for),
    isFilled(profile.bio),
    isFilled(profile.city),
    isFilled(profile.country),
    isFilled(profile.search_country),
    isFilled(profile.search_mode),
    isFilled(profile.first_date_idea),
    isFilled(profile.weekend_habit),
    isFilled(profile.interests),
    isFilled(profile.avatar_url),
    isFilled(profile.preferred_age_min),
    isFilled(profile.preferred_age_max),
  ]

  const extra = profile.extra_profile_data || {}

  const extraChecks = EXTRA_PROFILE_FIELDS.map((field) =>
    isFilled(extra[field.key])
  )

  const total = coreChecks.length + extraChecks.length
  const completed = [...coreChecks, ...extraChecks].filter(Boolean).length

  const percentage =
    total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100))

  return {
    total,
    completed,
    percentage,
    remaining: Math.max(total - completed, 0),
  }
}