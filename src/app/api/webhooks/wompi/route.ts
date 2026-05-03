import { NextResponse } from "next/server"
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
  getPublicWompiStatus,
  getWompiTransactionFromEvent,
  isWompiConfigured,
  toWompiAmountInCents,
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

  const wompiEvent = payload as Parameters<typeof verifyWompiEventSignature>[0]
  const checksum = req.headers.get("x-event-checksum")

  if (!verifyWompiEventSignature(wompiEvent, checksum)) {
    return NextResponse.json(
      { error: "La firma del evento de Wompi no es valida." },
      { status: 400 }
    )
  }

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
      await finalizePaidOrder(payment.order.id)
      await sendOrderConfirmationEmail(payment.order.id).catch((error) => {
        console.error("Wompi webhook confirmation email error:", error)
      })
    }

    if (publicStatus === "failed" && payment.order.paymentStatus !== "PAID") {
      await markOrderPaymentFailed(
        payment.order.id,
        `Wompi marco la transaccion ${transaction.id} como ${transaction.status}.`
      )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Wompi webhook processing error:", error)

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
