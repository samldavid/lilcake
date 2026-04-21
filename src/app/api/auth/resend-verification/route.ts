import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { sendEmailVerificationEmailForUser } from "@/lib/account-security"
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
      key: buildRateLimitKey("auth-resend-verification", [session.user.id]),
      limit: 3,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        rateLimit.retryAfterSeconds,
        "Ya solicitaste varios correos de verificacion. Intenta de nuevo en unos minutos."
      )
    }

    await sendEmailVerificationEmailForUser(session.user.id)

    return NextResponse.json({
      message:
        "Si tu correo aun no estaba verificado, te enviamos un nuevo enlace.",
    })
  } catch (error) {
    console.error("Resend verification error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos reenviar el correo de verificacion.",
        }),
      },
      { status: 500 }
    )
  }
}
