import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import {
  getStripe,
  getStripeProductImages,
  getStripeUnitAmount,
  isStripeEnabled,
} from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import {
  checkoutRequestSchema,
  createPendingOrder,
  finalizePaidOrder,
  markOrderPaymentFailed,
  prepareCheckoutItems,
} from "@/lib/checkout"
import { authOptions } from "@/lib/auth"
import {
  CouponValidationError,
  createStripeDiscountCoupon,
  normalizeCouponCode,
} from "@/lib/coupons"
import { getPublicErrorMessage } from "@/lib/errors"
import { sendOrderConfirmationEmail } from "@/lib/order-notifications"

function getCheckoutStatus(orderPaymentStatus: string, stripePaymentStatus: string | null) {
  if (orderPaymentStatus === "PAID") {
    return "paid"
  }

  if (orderPaymentStatus === "FAILED") {
    return "failed"
  }

  if (stripePaymentStatus === "paid") {
    return "processing"
  }

  return "pending"
}

export async function GET(req: Request) {
  try {
    if (!isStripeEnabled()) {
      return NextResponse.json(
        { error: "Stripe no esta disponible en este entorno todavia." },
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesion." },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Debes enviar session_id" },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
    const orderId =
      checkoutSession.metadata?.orderId ||
      (
        await prisma.order.findFirst({
          where: { stripeSessionId: sessionId },
          select: { id: true },
        })
      )?.id

    if (!orderId) {
      return NextResponse.json(
        { error: "La sesion no esta asociada a una orden" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        orderNumber: true,
        paymentStatus: true,
        status: true,
      },
    })

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No encontramos la orden asociada a esa sesion." },
        { status: 404 }
      )
    }

    if (
      checkoutSession.metadata?.userId &&
      checkoutSession.metadata.userId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "No encontramos la orden asociada a esa sesion." },
        { status: 404 }
      )
    }

    if (
      checkoutSession.payment_status === "paid" &&
      order.paymentStatus !== "PAID"
    ) {
      const finalizedOrder = await finalizePaidOrder(order.id)
      await sendOrderConfirmationEmail(order.id).catch((error) => {
        console.error("Stripe return confirmation email error:", error)
      })

      return NextResponse.json({
        status: "paid",
        orderNumber: finalizedOrder.orderNumber,
      })
    }

    if (order.paymentStatus === "PAID") {
      await sendOrderConfirmationEmail(order.id).catch((error) => {
        console.error("Stripe paid order confirmation email retry error:", error)
      })
    }

    return NextResponse.json({
      status: getCheckoutStatus(
        order.paymentStatus,
        checkoutSession.payment_status ?? null
      ),
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error("Stripe Checkout Status Error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos validar el estado del pago.",
        }),
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  let pendingOrderId: string | undefined

  try {
    if (!isStripeEnabled()) {
      return NextResponse.json(
        { error: "Stripe no esta disponible en este entorno todavia." },
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

    const body = await req.json()
    const result = checkoutRequestSchema.safeParse({
      ...body,
      paymentMethod: "STRIPE",
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
    const origin = new URL(req.url).origin

    const stripeCurrency = "cop"
    const stripeDiscountCoupon =
      order.discount > 0
        ? await createStripeDiscountCoupon({
            currency: stripeCurrency,
            couponCode: normalizeCouponCode(payload.couponCode || "DESCUENTO"),
            discountAmount: order.discount,
            orderNumber: order.orderNumber,
          })
        : null

    const lineItems = checkoutItems.map((item) => ({
      price_data: {
        currency: stripeCurrency,
        product_data: {
          name: `${item.productName}${item.productSize ? ` (Talla: ${item.productSize})` : ""}`,
          images: getStripeProductImages(item.image, origin),
        },
        unit_amount: getStripeUnitAmount(item.unitPrice, stripeCurrency),
      },
      quantity: item.quantity,
    }))

    const stripe = getStripe()
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      client_reference_id: order.id,
      success_url: `${origin}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      customer_email: payload.customerEmail,
      ...(stripeDiscountCoupon
        ? {
            discounts: [{ coupon: stripeDiscountCoupon.id }],
          }
        : {}),
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session.user.id,
        couponCode: payload.couponCode
          ? normalizeCouponCode(payload.couponCode)
          : "",
        discountAmount: `${order.discount}`,
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    if (pendingOrderId) {
      await markOrderPaymentFailed(
        pendingOrderId,
        "No se pudo iniciar la sesion de Stripe."
      )
    }

    console.error("Stripe Checkout Error:", error)

    if (error instanceof CouponValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos iniciar el pago con Stripe.",
        }),
      },
      { status: 500 }
    )
  }
}
