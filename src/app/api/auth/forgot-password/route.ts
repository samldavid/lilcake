import { NextResponse } from "next/server"
import { sendPasswordResetEmail } from "@/lib/account-security"
import { forgotPasswordSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parse = forgotPasswordSchema.safeParse(body)

    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.issues[0]?.message || "Email inválido" },
        { status: 400 }
      )
    }

    await sendPasswordResetEmail(parse.data.email)

    return NextResponse.json({
      message:
        "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer la contraseña.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "No pudimos procesar la solicitud ahora mismo." },
      { status: 500 }
    )
  }
}
