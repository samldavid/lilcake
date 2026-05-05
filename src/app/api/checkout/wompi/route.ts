import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  checkoutRequestSchema,
  createPendingOrder,
  finalizePaidOrder,
  markOrderPaymentFailed,
  prepareCheckoutItems,
} from "@/lib/checkout"
import { CouponValidationError } from "@/lib/coupons"
import { getPublicErrorMessage } from "@/lib/errors"
import { sendOrderConfirmationEmail } from "@/lib/order-notifications"
import {
  createOrReuseWompiCheckout,
  findOrderForWompiTransaction,
  updateWompiPaymentTransaction,
  validateWompiTransactionForOrder,
} from "@/lib/wompi-payments"
import {
  fetchWompiTransaction,
  getPublicWompiStatus,
  isWompiCheckoutEnabled,
  toWompiAmountInCents,
} from "@/lib/wompi"
import { getTrustedAppOrigin } from "@/lib/app-url"
import {
  consumeCheckoutRateLimit,
  createCheckoutRateLimitResponse,
} from "@/lib/checkout-rate-limit"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesion." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const transactionId =
      searchParams.get("id") || searchParams.get("transaction_id")

    if (!transactionId) {
      return NextResponse.json(
        { error: "Debes enviar el id de la transaccion de Wompi." },
        { status: 400 }
      )
    }

    const transaction = await fetchWompiTransaction(transactionId)
    const payment = await findOrderForWompiTransaction(transaction)

    if (!payment || payment.order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No encontramos el pedido asociado a esa transaccion." },
        { status: 404 }
      )
    }

    validateWompiTransactionForOrder({
      transaction,
      amountInCents: toWompiAmountInCents(payment.order.total),
    })

    await updateWompiPaymentTransaction({ transaction })

    const publicStatus = getPublicWompiStatus(transaction.status)

    if (publicStatus === "paid" && payment.order.paymentStatus !== "PAID") {
      const finalizedOrder = await finalizePaidOrder(payment.order.id)
      await sendOrderConfirmationEmail(payment.order.id).catch((error) => {
        console.error("Wompi return confirmation email error:", error)
      })

      return NextResponse.json({
        status: "paid",
        orderNumber: finalizedOrder.orderNumber,
      })
    }

    if (publicStatus === "failed" && payment.order.paymentStatus !== "PAID") {
      await markOrderPaymentFailed(
        payment.order.id,
        `Wompi marco la transaccion ${transaction.id} como ${transaction.status}.`
      )
    }

    return NextResponse.json({
      status:
        payment.order.paymentStatus === "PAID" ? "paid" : publicStatus,
      orderNumber: payment.order.orderNumber,
    })
  } catch (error) {
    console.error("Wompi Checkout Status Error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos validar el estado del pago con Wompi.",
        }),
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  let pendingOrderId: string | undefined

  try {
    if (!isWompiCheckoutEnabled()) {
      return NextResponse.json(
        { error: "Wompi no esta disponible en este entorno todavia." },
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesion" },
        { status: 401 }
      )
    }

    const rateLimit = consumeCheckoutRateLimit(req, session.user.id, "wompi")

    if (!rateLimit.allowed) {
      return createCheckoutRateLimitResponse(rateLimit.retryAfterSeconds)
    }

    const body = await req.json()
    const result = checkoutRequestSchema.safeParse({
      ...body,
      paymentMethod: "WOMPI",
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Datos invalidos" },
        { status: 400 }
      )
    }

    const payload = result.data
    const checkoutItems = await prepareCheckoutItems(payload.items)
    const order = await createPendingOrder(session.user.id, payload, checkoutItems)
    pendingOrderId = order.id

    const { url, reference } = await createOrReuseWompiCheckout({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        customerEmail: payload.customerEmail,
        shippingName: payload.shippingName,
        shippingPhone: payload.shippingPhone,
      },
      origin: getTrustedAppOrigin(req.url),
    })

    return NextResponse.json({
      url,
      orderNumber: order.orderNumber,
      reference,
    })
  } catch (error) {
    if (pendingOrderId) {
      await markOrderPaymentFailed(
        pendingOrderId,
        "No se pudo iniciar la sesion de Wompi."
      )
    }

    console.error("Wompi Checkout Error:", error)

    if (error instanceof CouponValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos iniciar el pago con Wompi.",
        }),
      },
      { status: 500 }
    )
  }
}
