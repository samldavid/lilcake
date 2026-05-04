import { NextResponse } from "next/server"
import {
  adminNotFoundResponse,
  requireAdminApiSession,
} from "@/lib/auth-guards"
import {
  getBusinessSettingsView,
  saveBusinessSettings,
} from "@/lib/business-settings"
import { getPublicErrorMessage } from "@/lib/errors"

export async function GET() {
  const session = await requireAdminApiSession()

  if (!session) {
    return adminNotFoundResponse()
  }

  const settings = await getBusinessSettingsView()
  return NextResponse.json(settings)
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAdminApiSession()

    if (!session) {
      return adminNotFoundResponse()
    }

    const body = await req.json()
    const result = await saveBusinessSettings(body, session.user.id)

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.settings)
  } catch (error) {
    console.error("Business settings PATCH error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos guardar la configuracion del negocio.",
        }),
      },
      { status: 500 }
    )
  }
}
