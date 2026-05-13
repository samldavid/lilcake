import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  finalizePaidOrder,
  markOrderPaymentFailed,
} from "@/lib/checkout"
import { getPublicErrorMessage } from "@/lib/errors"
import { sendOrderConfirmationEmail } from "@/lib/order-notifications"
import {
  findOrderForWompiTransaction,
  updateWompiPaymentTransaction,
  validateWompiTransactionForOrder,
} from "@/lib/wompi-payments"
import {
  WOMPI_PROVIDER,
  getPublicWompiStatus,
  getWompiTransactionFromEvent,
  isWompiConfigured,
  toWompiAmountInCents,
  type WompiEventPayload,
  verifyWompiEventSignature,
} from "@/lib/wompi"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: "WOMPI",
    configured: isWompiConfigured(),
  })
}

export async function POST(req: Request) {
  if (!isWompiConfigured()) {
    return NextResponse.json(
      { error: "Wompi no esta configurado en este entorno." },
      { status: 503 }
    )
  }

  let payload: unknown

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json(
      { error: "El cuerpo del evento no es JSON valido." },
      { status: 400 }
    )
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { error: "El evento de Wompi no tiene el formato esperado." },
      { status: 400 }
    )
  }

  const wompiEvent = payload as WompiEventPayload
  const checksum = req.headers.get("x-event-checksum")

  if (!verifyWompiEventSignature(wompiEvent, checksum)) {
    return NextResponse.json(
      { error: "La firma del evento de Wompi no es valida." },
      { status: 400 }
    )
  }

  let webhookEventId: string | null = null

  try {
    if (wompiEvent.event !== "transaction.updated") {
      return NextResponse.json({ received: true, ignored: true })
    }

    const transaction = getWompiTransactionFromEvent(wompiEvent)

    if (!transaction) {
      return NextResponse.json(
        { error: "El evento no incluye una transaccion valida." },
        { status: 400 }
      )
    }

    const eventChecksum = checksum || wompiEvent.signature?.checksum || null
    const eventId = [
      wompiEvent.event,
      transaction.reference,
      transaction.id,
      transaction.status,
      wompiEvent.timestamp,
      eventChecksum || "no-checksum",
    ].join(":")

    try {
      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          provider: WOMPI_PROVIDER,
          eventId,
          checksum: eventChecksum,
          payload: payload as Prisma.InputJsonValue,
        },
        select: {
          id: true,
        },
      })
      webhookEventId = webhookEvent.id
    } catch (idempotencyError) {
      if (
        idempotencyError instanceof Prisma.PrismaClientKnownRequestError &&
        idempotencyError.code === "P2002"
      ) {
        return NextResponse.json({ received: true, duplicate: true })
      }

      throw idempotencyError
    }

    const payment = await findOrderForWompiTransaction(transaction)

    if (!payment) {
      throw new Error(
        `No encontramos una orden para la referencia Wompi ${transaction.reference}.`
      )
    }

    validateWompiTransactionForOrder({
      transaction,
      amountInCents: toWompiAmountInCents(payment.order.total),
    })

    await updateWompiPaymentTransaction({
      transaction,
      payload,
    })

    const publicStatus = getPublicWompiStatus(transaction.status)

    if (publicStatus === "paid") {
      const finalizedOrder = await finalizePaidOrder(payment.order.id)

      if (finalizedOrder.status !== "CANCELLED") {
        await sendOrderConfirmationEmail(payment.order.id).catch((error) => {
          console.error("Wompi webhook confirmation email error:", error)
        })
      }
    }

    if (publicStatus === "failed" && payment.order.paymentStatus !== "PAID") {
      await markOrderPaymentFailed(
        payment.order.id,
        `Wompi marco la transaccion ${transaction.id} como ${transaction.status}.`
      )
    }

    if (webhookEventId) {
      await prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: { processedAt: new Date() },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Wompi webhook processing error:", error)

    if (webhookEventId) {
      await prisma.webhookEvent.delete({
        where: { id: webhookEventId },
      }).catch((deleteError) => {
        console.error("Wompi webhook idempotency cleanup error:", deleteError)
      })
    }

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos procesar el webhook de Wompi.",
        }),
      },
      { status: 500 }
    )
  }
}
