import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { finalizePaidOrder, markOrderPaymentFailed } from "@/lib/checkout"
import { getStripe, isStripeEnabled } from "@/lib/stripe"

export const runtime = "nodejs"

async function findOrderForCheckoutSession(session: Stripe.Checkout.Session) {
  const metadataOrderId = session.metadata?.orderId

  if (metadataOrderId) {
    const order = await prisma.order.findUnique({
      where: { id: metadataOrderId },
      select: {
        id: true,
        userId: true,
        orderNumber: true,
        paymentStatus: true,
        stripeSessionId: true,
      },
    })

    if (order) {
      return order
    }
  }

  if (!session.id) {
    return null
  }

  return prisma.order.findFirst({
    where: { stripeSessionId: session.id },
    select: {
      id: true,
      userId: true,
      orderNumber: true,
      paymentStatus: true,
      stripeSessionId: true,
    },
  })
}

async function syncStripeSessionOnOrder(orderId: string, stripeSessionId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { stripeSessionId },
  })
}

async function completeStripeOrder(session: Stripe.Checkout.Session) {
  const order = await findOrderForCheckoutSession(session)

  if (!order) {
    throw new Error(`No encontramos la orden para la sesion ${session.id}.`)
  }

  if (session.metadata?.userId && order.userId !== session.metadata.userId) {
    throw new Error(
      `La sesion ${session.id} no coincide con el usuario esperado para la orden ${order.orderNumber}.`
    )
  }

  if (session.id && order.stripeSessionId !== session.id) {
    await syncStripeSessionOnOrder(order.id, session.id)
  }

  return finalizePaidOrder(order.id)
}

async function failStripeOrder(session: Stripe.Checkout.Session, reason: string) {
  const order = await findOrderForCheckoutSession(session)

  if (!order) {
    throw new Error(`No encontramos la orden para la sesion ${session.id}.`)
  }

  if (order.paymentStatus === "PAID") {
    return order
  }

  if (order.stripeSessionId && session.id && order.stripeSessionId !== session.id) {
    return order
  }

  return markOrderPaymentFailed(order.id, reason, session.id)
}

export async function POST(req: Request) {
  if (!isStripeEnabled()) {
    return NextResponse.json(
      { error: "Stripe no esta disponible en este entorno." },
      { status: 503 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Falta STRIPE_WEBHOOK_SECRET para verificar el webhook." },
      { status: 503 }
    )
  }

  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Falta la firma del webhook." },
      { status: 400 }
    )
  }

  const payload = await req.text()

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos verificar la firma."

    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status === "paid") {
          await completeStripeOrder(session)
        }
        break
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session
        await completeStripeOrder(session)
        break
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session
        await failStripeOrder(
          session,
          "Stripe marco el pago como fallido en el webhook."
        )
        break
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session
        await failStripeOrder(
          session,
          "La sesion de pago expiro antes de completarse."
        )
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos procesar el webhook."

    console.error("Stripe webhook processing error:", error)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
