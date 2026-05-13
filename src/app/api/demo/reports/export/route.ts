import { NextResponse } from "next/server"
import {
  buildAdminDemoReportFileName,
  exportAdminDemoReportAsPdf,
  exportAdminDemoReportAsWorkbook,
} from "@/lib/admin-demo-reports"
import {
  reportFiltersSchema,
  reportFormatSchema,
} from "@/lib/business-reports"
import { getPublicErrorMessage } from "@/lib/errors"
import {
  buildRateLimitKey,
  consumeRateLimit,
  createRateLimitResponse,
  getRequestIp,
} from "@/lib/rate-limit"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const rateLimit = consumeRateLimit({
      key: buildRateLimitKey("demo-report-export", [getRequestIp(req)]),
      limit: 6,
      windowMs: 10 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        rateLimit.retryAfterSeconds,
        "Hiciste demasiadas exportaciones demo. Intenta de nuevo en unos minutos."
      )
    }

    const { searchParams } = new URL(req.url)
    const result = reportFiltersSchema.safeParse({
      kind: searchParams.get("kind") ?? undefined,
      preset: searchParams.get("preset") ?? undefined,
      startDate: searchParams.get("startDate") ?? undefined,
      endDate: searchParams.get("endDate") ?? undefined,
      format: searchParams.get("format") ?? undefined,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error.issues[0]?.message ??
            "No pudimos interpretar la exportacion demo solicitada.",
        },
        { status: 400 }
      )
    }

    const formatResult = reportFormatSchema.safeParse(result.data.format)

    if (!formatResult.success) {
      return NextResponse.json(
        { error: "Debes elegir un formato de exportacion valido." },
        { status: 400 }
      )
    }

    const fileBaseName = await buildAdminDemoReportFileName(result.data)
    const format = formatResult.data

    if (format === "xlsx") {
      const buffer = await exportAdminDemoReportAsWorkbook(result.data)

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${fileBaseName}.xlsx"`,
          "Cache-Control": "no-store",
        },
      })
    }

    const buffer = await exportAdminDemoReportAsPdf(result.data)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileBaseName}.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Admin demo report export error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos generar la exportacion demo.",
        }),
      },
      { status: 500 }
    )
  }
}
