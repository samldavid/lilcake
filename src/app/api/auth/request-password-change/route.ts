import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { sendPasswordChangeEmailForUser } from "@/lib/account-security"
import { authOptions } from "@/lib/auth"
import {
  buildRateLimitKey,
  consumeRateLimit,
  createRateLimitResponse,
} from "@/lib/rate-limit"
import { getPublicErrorMessage } from "@/lib/errors"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const rateLimit = consumeRateLimit({
      key: buildRateLimitKey("auth-request-password-change", [session.user.id]),
      limit: 3,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        rateLimit.retryAfterSeconds,
        "Ya solicitaste varios correos de cambio de contrasena. Intenta de nuevo en unos minutos."
      )
    }

    const result = await sendPasswordChangeEmailForUser(session.user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      message: result.message,
    })
  } catch (error) {
    console.error("Request password change error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage:
            "No pudimos enviar el correo para cambiar la contrasena.",
        }),
      },
      { status: 500 }
    )
  }
}
