import { createHash } from "crypto"
import { NextResponse } from "next/server"

type RateLimitBucket = {
  count: number
  resetAt: number
}

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

const globalForRateLimit = globalThis as typeof globalThis & {
  lilcakeRateLimitStore?: Map<string, RateLimitBucket>
}

const rateLimitStore =
  globalForRateLimit.lilcakeRateLimitStore ?? new Map<string, RateLimitBucket>()

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.lilcakeRateLimitStore = rateLimitStore
}

function cleanupExpiredBuckets(now: number) {
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }
}

export function hashRateLimitValue(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown"
}

export function buildRateLimitKey(
  namespace: string,
  values: Array<string | null | undefined>
) {
  const normalizedValues = values
    .map((value) => value?.trim())
    .filter(Boolean) as string[]

  return `${namespace}:${hashRateLimitValue(normalizedValues.join(":") || "anonymous")}`
}

export function consumeRateLimit(options: RateLimitOptions) {
  const now = Date.now()
  cleanupExpiredBuckets(now)

  const currentBucket = rateLimitStore.get(options.key)

  if (!currentBucket || currentBucket.resetAt <= now) {
    rateLimitStore.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    })

    return {
      allowed: true,
      remaining: Math.max(0, options.limit - 1),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    }
  }

  if (currentBucket.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((currentBucket.resetAt - now) / 1000)
      ),
    }
  }

  currentBucket.count += 1
  rateLimitStore.set(options.key, currentBucket)

  return {
    allowed: true,
    remaining: Math.max(0, options.limit - currentBucket.count),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((currentBucket.resetAt - now) / 1000)
    ),
  }
}

export function resetRateLimit(key: string) {
  rateLimitStore.delete(key)
}

export function createRateLimitResponse(
  retryAfterSeconds: number,
  message = "Demasiados intentos. Intenta de nuevo en unos minutos."
) {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  )
}
