import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

function rewriteToNotFound(request: NextRequest) {
  const notFoundUrl = new URL("/__admin_not_found__", request.url)
  return NextResponse.rewrite(notFoundUrl)
}

function isProtectedAdminPage(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/")
}

function isProtectedAdminApi(pathname: string) {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/")
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminRoute = isProtectedAdminPage(pathname)
  const isAdminLoginRoute = pathname === "/admin/login"
  const isAdminApiRoute = isProtectedAdminApi(pathname)

  if (isAdminRoute || isAdminApiRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (isAdminApiRoute) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.json({ error: "Not Found" }, { status: 404 })
      }

      return NextResponse.next()
    }

    if (isAdminLoginRoute) {
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }

      return rewriteToNotFound(request)
    }

    if (!token || token.role !== "ADMIN") {
      return rewriteToNotFound(request)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
