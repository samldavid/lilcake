import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { sendEmailVerificationEmailForUser } from "@/lib/account-security"
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

    await sendEmailVerificationEmailForUser(session.user.id)

    return NextResponse.json({
      message:
        "Si tu correo aún no estaba verificado, te enviamos un nuevo enlace.",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "No pudimos reenviar el correo de verificación." },
      { status: 500 }
    )
  }
}
