import { NextResponse } from "next/server"
import { verifyEmailWithToken } from "@/lib/account-security"
import {
  buildRateLimitKey,
  consumeRateLimit,
  getRequestIp,
} from "@/lib/rate-limit"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  const redirectUrl = new URL("/verificar-correo", req.url)

  if (!token) {
    redirectUrl.searchParams.set("status", "invalid")
    return NextResponse.redirect(redirectUrl)
  }

  const rateLimit = consumeRateLimit({
    key: buildRateLimitKey("auth-verify-email", [getRequestIp(req), token]),
    limit: 10,
    windowMs: 15 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    redirectUrl.searchParams.set("status", "invalid")
    redirectUrl.searchParams.set("reason", "rate-limited")
    return NextResponse.redirect(redirectUrl)
  }

  const result = await verifyEmailWithToken(token)
  redirectUrl.searchParams.set("status", result.success ? "success" : "invalid")

  return NextResponse.redirect(redirectUrl)
}
