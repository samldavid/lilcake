import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendEmailVerificationEmailForUser } from "@/lib/account-security"
import { registerSchema } from "@/lib/validations"
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
      key: buildRateLimitKey("auth-register", [
        getRequestIp(req),
        emailForRateLimit,
      ]),
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        rateLimit.retryAfterSeconds,
        "Hiciste demasiados intentos de registro. Intenta de nuevo en unos minutos."
      )
    }

    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, phone } = result.data
    const normalizedEmail = email.toLowerCase().trim()
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || null,
        role: "CUSTOMER",
      },
    })

    try {
      await sendEmailVerificationEmailForUser(user.id)
    } catch (mailError) {
      console.error("Registration verification email error:", mailError)
    }

    return NextResponse.json(
      {
        message: "Cuenta creada exitosamente",
        verificationEmailSent: true,
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "Error interno del servidor.",
        }),
      },
      { status: 500 }
    )
  }
}
