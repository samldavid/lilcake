import { NextResponse } from "next/server"
import { getAdminDemoOrderDetail } from "@/lib/admin-demo-data"
import {
  buildSalesNoteFileName,
  generateSalesNotePdf,
} from "@/lib/sales-note"
import { getDemoSalesNoteBusinessDetails } from "@/lib/business-settings"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const order = getAdminDemoOrderDetail(id)

  if (!order) {
    return NextResponse.json(
      { error: "No encontramos el pedido demo." },
      { status: 404 }
    )
  }

  const pdf = await generateSalesNotePdf(order, getDemoSalesNoteBusinessDetails())

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${buildSalesNoteFileName(order.orderNumber)}"`,
      "Cache-Control": "no-store",
    },
  })
}
