import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import {
  buildRateLimitKey,
  consumeRateLimit,
  createRateLimitHeaders,
  getRequestIp,
} from "@/lib/rate-limit"

type ProxyRateLimitRule = {
  namespace: string
  limit: number
  windowMs: number
  message: string
  matches: (pathname: string, method: string) => boolean
}

const ONE_MINUTE = 60 * 1000
const TEN_MINUTES = 10 * ONE_MINUTE

const proxyRateLimitRules: ProxyRateLimitRule[] = [
  {
    namespace: "proxy-global-ip",
    limit: 180,
    windowMs: ONE_MINUTE,
    message: "Demasiadas solicitudes. Espera un momento e intenta de nuevo.",
    matches: () => true,
  },
  {
    namespace: "proxy-api-ip",
    limit: 90,
    windowMs: ONE_MINUTE,
    message:
      "Demasiadas solicitudes al API. Espera un momento e intenta de nuevo.",
    matches: (pathname) =>
      pathname.startsWith("/api/") && !isWebhookApi(pathname),
  },
  {
    namespace: "proxy-write-ip",
    limit: 40,
    windowMs: ONE_MINUTE,
    message:
      "Demasiadas acciones seguidas. Espera un momento e intenta de nuevo.",
    matches: (pathname, method) =>
      isUnsafeMethod(method) && !isWebhookApi(pathname),
  },
  {
    namespace: "proxy-auth-ip",
    limit: 20,
    windowMs: TEN_MINUTES,
    message:
      "Demasiados intentos de autenticacion. Intenta de nuevo en unos minutos.",
    matches: (pathname, method) =>
      method === "POST" && pathname.startsWith("/api/auth/"),
  },
]

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

function isWebhookApi(pathname: string) {
  return pathname === "/api/webhooks" || pathname.startsWith("/api/webhooks/")
}

function isUnsafeMethod(method: string) {
  return !["GET", "HEAD", "OPTIONS"].includes(method)
}

function createBlockedResponse(
  request: NextRequest,
  status: number,
  message: string,
  headers: Record<string, string> = {}
) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: message },
      {
        status,
        headers,
      }
    )
  }

  return new NextResponse(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...headers,
    },
  })
}

function enforceProxyRateLimits(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getRequestIp(request)

  for (const rule of proxyRateLimitRules) {
    if (!rule.matches(pathname, request.method)) {
      continue
    }

    const result = consumeRateLimit({
      key: buildRateLimitKey(rule.namespace, [ip]),
      limit: rule.limit,
      windowMs: rule.windowMs,
    })

    if (!result.allowed) {
      return createBlockedResponse(request, 429, rule.message, {
        ...createRateLimitHeaders(result),
        "X-RateLimit-Policy": rule.namespace,
      })
    }
  }

  return null
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminRoute = isProtectedAdminPage(pathname)
  const isAdminLoginRoute = pathname === "/admin/login"
  const isAdminApiRoute = isProtectedAdminApi(pathname)

  if (request.headers.has("x-middleware-subrequest")) {
    return createBlockedResponse(request, 403, "Forbidden", {
      "Cache-Control": "no-store",
    })
  }

  const rateLimitResponse = enforceProxyRateLimits(request)

  if (rateLimitResponse) {
    return rateLimitResponse
  }

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
  matcher: ["/((?!_next/|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
}
