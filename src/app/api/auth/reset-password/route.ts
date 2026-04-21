import { NextResponse } from "next/server"
import { resetPasswordWithToken } from "@/lib/account-security"
import { resetPasswordSchema } from "@/lib/validations"
import {
  buildRateLimitKey,
  consumeRateLimit,
  createRateLimitResponse,
  getRequestIp,
} from "@/lib/rate-limit"
import { getPublicErrorMessage } from "@/lib/errors"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const tokenForRateLimit =
      body && typeof body === "object" && typeof body.token === "string"
        ? body.token
        : ""
    const rateLimit = consumeRateLimit({
      key: buildRateLimitKey("auth-reset-password", [
        getRequestIp(req),
        tokenForRateLimit,
      ]),
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        rateLimit.retryAfterSeconds,
        "Hiciste demasiados intentos de cambio de contrasena. Intenta de nuevo en unos minutos."
      )
    }

    const parse = resetPasswordSchema.safeParse(body)

    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.issues[0]?.message || "Datos invalidos" },
        { status: 400 }
      )
    }

    const result = await resetPasswordWithToken(
      parse.data.token,
      parse.data.password
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      message: result.message,
    })
  } catch (error) {
    console.error("Reset password error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos actualizar tu contrasena.",
        }),
      },
      { status: 500 }
    )
  }
}
