import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { sendPasswordChangeEmailForUser } from "@/lib/account-security"
import { authOptions } from "@/lib/auth"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const result = await sendPasswordChangeEmailForUser(session.user.id)

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
    console.error("Request password change error:", error)
    return NextResponse.json(
      { error: "No pudimos enviar el correo para cambiar la contraseña." },
      { status: 500 }
    )
  }
}
