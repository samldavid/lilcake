import { NextResponse } from "next/server"
import { sendPasswordResetEmail } from "@/lib/account-security"
import { forgotPasswordSchema } from "@/lib/validations"
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
    const emailForRateLimit =
      body && typeof body === "object" && typeof body.email === "string"
        ? body.email.toLowerCase().trim()
        : ""
    const rateLimit = consumeRateLimit({
      key: buildRateLimitKey("auth-forgot-password", [
        getRequestIp(req),
        emailForRateLimit,
      ]),
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        rateLimit.retryAfterSeconds,
        "Hiciste demasiadas solicitudes de recuperacion. Intenta de nuevo en unos minutos."
      )
    }

    const parse = forgotPasswordSchema.safeParse(body)

    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.issues[0]?.message || "Email invalido" },
        { status: 400 }
      )
    }

    await sendPasswordResetEmail(parse.data.email)

    return NextResponse.json({
      message:
        "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer la contrasena.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos procesar la solicitud ahora mismo.",
        }),
      },
      { status: 500 }
    )
  }
}
