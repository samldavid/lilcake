import { NextResponse } from "next/server"
import {
  adminNotFoundResponse,
  requireAdminApiSession,
} from "@/lib/auth-guards"
import {
  getSerializedReportSummary,
  reportFiltersSchema,
} from "@/lib/business-reports"
import { getPublicErrorMessage } from "@/lib/errors"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const session = await requireAdminApiSession()

    if (!session) {
      return adminNotFoundResponse()
    }

    const { searchParams } = new URL(req.url)
    const result = reportFiltersSchema.safeParse({
      kind: searchParams.get("kind") ?? undefined,
      preset: searchParams.get("preset") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.issues[0]?.message ?? "No pudimos interpretar el rango del reporte.",
        },
        { status: 400 }
      )
    }

    const summary = await getSerializedReportSummary(result.data)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Admin report summary error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos calcular el resumen del reporte.",
        }),
      },
      { status: 500 }
    )
  }
}
