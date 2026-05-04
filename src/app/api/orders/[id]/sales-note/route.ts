import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  buildSalesNoteFileName,
  generateSalesNotePdf,
  salesNoteOrderSelect,
} from "@/lib/sales-note"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const { id } = await params
  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: salesNoteOrderSelect,
  })

  if (!order) {
    return NextResponse.json(
      { error: "No encontramos el pedido." },
      { status: 404 }
    )
  }

  const pdf = await generateSalesNotePdf(order)

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${buildSalesNoteFileName(order.orderNumber)}"`,
      "Cache-Control": "no-store",
    },
  })
}
