function normalizeOrigin(value: string) {
  const rawValue = value.trim()

  if (!rawValue) {
    return null
  }

  const candidate = rawValue.startsWith("http")
    ? rawValue
    : `https://${rawValue}`

  try {
    const url = new URL(candidate)

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null
    }

    return url.origin
  } catch {
    return null
  }
}

export function getConfiguredAppOrigin() {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    const origin = normalizeOrigin(candidate)

    if (origin) {
      return origin
    }
  }

  return null
}

export function getTrustedAppOrigin(requestUrl?: string) {
  const configuredOrigin = getConfiguredAppOrigin()

  if (configuredOrigin) {
    return configuredOrigin
  }

  if (process.env.NODE_ENV !== "production" && requestUrl) {
    return new URL(requestUrl).origin
  }

  return "http://localhost:3000"
}

export function buildTrustedAppUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${getTrustedAppOrigin()}${normalizedPath}`
}
