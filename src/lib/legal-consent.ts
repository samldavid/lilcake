export const TERMS_CONSENT_COOKIE_NAME = "lilcake_terms_consent"
export const TERMS_CONSENT_COOKIE_MAX_AGE_SECONDS = 10 * 60

export function buildTermsConsentCookieValue() {
  return "accepted"
}

export function hasAcceptedTermsCookie(value?: string | null) {
  return value === buildTermsConsentCookieValue()
}
