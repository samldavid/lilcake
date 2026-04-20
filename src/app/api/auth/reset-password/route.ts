import { NextResponse } from "next/server"
import { resetPasswordWithToken } from "@/lib/account-security"
import { resetPasswordSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parse = resetPasswordSchema.safeParse(body)

    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      )
    }

    const result = await resetPasswordWithToken(
      parse.data.token,
      parse.data.password
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: result.message,
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "No pudimos actualizar tu contraseña." },
      { status: 500 }
    )
  }
}
