import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateOrderSchema } from "@/lib/validations"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = updateOrderSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Datos invalidos." },
        { status: 400 }
      )
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
      },
    })

    if (!currentOrder) {
      return NextResponse.json(
        { error: "No encontramos el pedido." },
        { status: 404 }
      )
    }

    const data = result.data
    const nextData: {
      status?: string
      paymentStatus?: string
      trackingNumber?: string | null
      notes?: string | null
    } = {}

    if (data.status) {
      nextData.status = data.status
    }

    if (data.paymentStatus) {
      nextData.paymentStatus = data.paymentStatus
    }

    if (Object.prototype.hasOwnProperty.call(body, "trackingNumber")) {
      nextData.trackingNumber = data.trackingNumber?.trim() || null
    }

    if (Object.prototype.hasOwnProperty.call(body, "notes")) {
      nextData.notes = data.notes?.trim() || null
    }

    if (nextData.paymentStatus === "PAID" && !nextData.status && currentOrder.status === "PENDING") {
      nextData.status = "CONFIRMED"
    }

    if (
      nextData.status === "CANCELLED" &&
      !nextData.paymentStatus &&
      currentOrder.paymentStatus !== "PAID"
    ) {
      nextData.paymentStatus = "FAILED"
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: nextData,
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        trackingNumber: true,
        notes: true,
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos actualizar el pedido."

    console.error("Admin order PATCH error:", error)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
