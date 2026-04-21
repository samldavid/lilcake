import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canCustomerCancelOrder } from "@/lib/order-status"
import { releaseCouponUsage } from "@/lib/coupons"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesion." }, { status: 401 })
    }

    const { id } = await params
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        couponId: true,
        userId: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "No encontramos el pedido." },
        { status: 404 }
      )
    }

    if (!canCustomerCancelOrder(order)) {
      return NextResponse.json(
        { error: "Este pedido ya no se puede cancelar." },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (order.couponId && order.paymentStatus !== "PAID") {
        await releaseCouponUsage(tx, order.couponId, order.userId)
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          paymentStatus: order.paymentStatus === "PAID" ? "PAID" : "FAILED",
        },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
        },
      })
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos cancelar el pedido."

    console.error("Cancel order error:", error)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
