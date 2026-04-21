import { NextResponse } from "next/server"
import { OrderStatus, PaymentStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { updateOrderSchema } from "@/lib/validations"
import { releaseCouponUsage } from "@/lib/coupons"
import {
  adminNotFoundResponse,
  requireAdminApiSession,
} from "@/lib/auth-guards"
import { getPublicErrorMessage } from "@/lib/errors"
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
} from "@/lib/order-notifications"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApiSession()

    if (!session) {
      return adminNotFoundResponse()
    }

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
        couponId: true,
        userId: true,
        trackingNumber: true,
        shippingCarrier: true,
        confirmedAt: true,
        shippedAt: true,
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
      status?: OrderStatus
      paymentStatus?: PaymentStatus
      shippingCarrier?: string | null
      trackingNumber?: string | null
      confirmedAt?: Date | null
      shippedAt?: Date | null
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

    if (Object.prototype.hasOwnProperty.call(body, "shippingCarrier")) {
      nextData.shippingCarrier = data.shippingCarrier?.trim() || null
    }

    if (Object.prototype.hasOwnProperty.call(body, "notes")) {
      nextData.notes = data.notes?.trim() || null
    }

    if (nextData.paymentStatus === "PAID" && !nextData.status && currentOrder.status === "PENDING") {
      nextData.status = "CONFIRMED"
    }

    const effectiveStatus = nextData.status ?? currentOrder.status
    const effectivePaymentStatus =
      nextData.paymentStatus ?? currentOrder.paymentStatus
    const effectiveTrackingNumber =
      Object.prototype.hasOwnProperty.call(nextData, "trackingNumber")
        ? nextData.trackingNumber ?? null
        : currentOrder.trackingNumber
    const effectiveShippingCarrier =
      Object.prototype.hasOwnProperty.call(nextData, "shippingCarrier")
        ? nextData.shippingCarrier ?? null
        : currentOrder.shippingCarrier

    const effectiveIsConfirmedState = ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(
      effectiveStatus
    )
    const currentIsConfirmedState = ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(
      currentOrder.status
    )
    const orderJustConfirmed =
      (!currentIsConfirmedState && effectiveIsConfirmedState) ||
      (currentOrder.paymentStatus !== "PAID" && effectivePaymentStatus === "PAID")
    const orderJustShipped =
      currentOrder.status !== "SHIPPED" && effectiveStatus === "SHIPPED"

    if (
      effectiveStatus === "SHIPPED" &&
      (!effectiveTrackingNumber || !effectiveShippingCarrier)
    ) {
      return NextResponse.json(
        {
          error:
            "Agrega la transportadora y el numero de guia antes de marcar el pedido como enviado.",
        },
        { status: 400 }
      )
    }

    if (orderJustConfirmed && !currentOrder.confirmedAt) {
      nextData.confirmedAt = new Date()
    }

    if (orderJustShipped && !currentOrder.shippedAt) {
      nextData.shippedAt = new Date()
    }

    if (
      nextData.status === "CANCELLED" &&
      !nextData.paymentStatus &&
      currentOrder.paymentStatus !== "PAID"
    ) {
      nextData.paymentStatus = "FAILED"
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (
        nextData.status === "CANCELLED" &&
        currentOrder.status !== "CANCELLED" &&
        currentOrder.paymentStatus !== "PAID" &&
        currentOrder.couponId
      ) {
        await releaseCouponUsage(tx, currentOrder.couponId, currentOrder.userId)
      }

      return tx.order.update({
        where: { id },
        data: nextData,
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          shippingCarrier: true,
          trackingNumber: true,
          confirmedAt: true,
          shippedAt: true,
          notes: true,
        },
      })
    })

    if (orderJustConfirmed) {
      await sendOrderConfirmationEmail(id).catch((error) => {
        console.error("Admin order confirmation email error:", error)
      })
    }

    if (orderJustShipped) {
      await sendOrderShippedEmail(id).catch((error) => {
        console.error("Admin order shipping email error:", error)
      })
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Admin order PATCH error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos actualizar el pedido.",
        }),
      },
      { status: 500 }
    )
  }
}
