import { NextResponse } from "next/server"
import {
  adminNotFoundResponse,
  requireAdminApiSession,
} from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import {
  buildSalesNoteFileName,
  generateSalesNotePdf,
  salesNoteOrderSelect,
} from "@/lib/sales-note"
import { getSalesNoteBusinessDetails } from "@/lib/business-settings"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApiSession()

  if (!session) {
    return adminNotFoundResponse()
  }

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    select: salesNoteOrderSelect,
  })

  if (!order) {
    return NextResponse.json(
      { error: "No encontramos el pedido." },
      { status: 404 }
    )
  }

  const businessDetails = await getSalesNoteBusinessDetails()
  const pdf = await generateSalesNotePdf(order, businessDetails)

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${buildSalesNoteFileName(order.orderNumber)}"`,
      "Cache-Control": "no-store",
    },
  })
}
