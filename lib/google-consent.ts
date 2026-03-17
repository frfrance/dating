export type ConsentChoice = 'accepted' | 'rejected'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export const CONSENT_STORAGE_KEY = 'henho_cookie_consent'

export function grantConsent() {
  window.gtag?.('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
  })
}

export function denyConsent() {
  window.gtag?.('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
}

export function saveConsentChoice(choice: ConsentChoice) {
  localStorage.setItem(CONSENT_STORAGE_KEY, choice)
}

export function getSavedConsentChoice(): ConsentChoice | null {
  const value = localStorage.getItem(CONSENT_STORAGE_KEY)
  if (value === 'accepted' || value === 'rejected') {
    return value
  }
  return null
}