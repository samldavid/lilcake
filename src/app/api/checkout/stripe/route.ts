import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import {
  checkoutRequestSchema,
  createPendingOrder,
  prepareCheckoutItems,
} from "@/lib/checkout"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Debes enviar session_id" },
        { status: 400 }
      )
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (!checkoutSession.metadata?.orderId) {
      return NextResponse.json(
        { error: "La sesion no esta asociada a una orden" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: checkoutSession.metadata.orderId },
      select: {
        id: true,
        orderNumber: true,
        paymentStatus: true,
        status: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "No encontramos la orden asociada a la sesion" },
        { status: 404 }
      )
    }

    if (checkoutSession.payment_status === "paid") {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: order.status === "PENDING" ? "CONFIRMED" : undefined,
        },
        select: {
          orderNumber: true,
        },
      })

      return NextResponse.json({
        status: "paid",
        orderNumber: updatedOrder.orderNumber,
      })
    }

    return NextResponse.json({
      status: checkoutSession.payment_status,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al validar el pago"

    console.error("Stripe Checkout Status Error:", error)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  let pendingOrderId: string | undefined

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 })
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

    const lineItems = checkoutItems.map((item) => ({
      price_data: {
        currency: "cop",
        product_data: {
          name: `${item.productName}${item.productSize ? ` (Talla: ${item.productSize})` : ""}`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.unitPrice),
      },
      quantity: item.quantity,
    }))

    const origin = new URL(req.url).origin

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      customer_email: payload.customerEmail,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    })

    return NextResponse.json({ url: checkoutSession.url, orderNumber: order.orderNumber })
  } catch (error) {
    if (pendingOrderId) {
      await prisma.order.update({
        where: { id: pendingOrderId },
        data: {
          paymentStatus: "FAILED",
          notes: "No se pudo iniciar la sesion de Stripe.",
        },
      })
    }

    const message =
      error instanceof Error ? error.message : "No pudimos iniciar el pago con Stripe"

    console.error("Stripe Checkout Error:", error)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
