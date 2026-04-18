import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Protect /admin routes ─────────────────
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Not logged in → redirect to login
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Not admin → forbidden
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // ── Protect /admin API routes ─────────────
  if (pathname.startsWith("/api/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }
  }

  // ── Security Headers ──────────────────────
  const response = NextResponse.next()
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )

  return response
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
