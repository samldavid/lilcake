import {
  buildRateLimitKey,
  consumeRateLimit,
  createRateLimitResponse,
  getRequestIp,
} from "@/lib/rate-limit"

export function consumeCheckoutRateLimit(
  request: Request,
  userId: string,
  action: string
) {
  return consumeRateLimit({
    key: buildRateLimitKey(`checkout-${action}`, [userId, getRequestIp(request)]),
    limit: 10,
    windowMs: 10 * 60 * 1000,
  })
}

export function createCheckoutRateLimitResponse(retryAfterSeconds: number) {
  return createRateLimitResponse(
    retryAfterSeconds,
    "Hiciste demasiadas acciones de pedido. Intenta de nuevo en unos minutos."
  )
}
