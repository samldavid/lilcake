import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  buildOrderWhatsAppLink,
  checkoutRequestSchema,
  createPendingOrder,
  prepareCheckoutItems,
} from "@/lib/checkout"
import { CouponValidationError } from "@/lib/coupons"
import { getPublicErrorMessage } from "@/lib/errors"
import { sendOrderReceivedEmail } from "@/lib/order-notifications"
import {
  consumeCheckoutRateLimit,
  createCheckoutRateLimitResponse,
} from "@/lib/checkout-rate-limit"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 })
    }

    const rateLimit = consumeCheckoutRateLimit(req, session.user.id, "whatsapp")

    if (!rateLimit.allowed) {
      return createCheckoutRateLimitResponse(rateLimit.retryAfterSeconds)
    }

    const body = await req.json()
    const result = checkoutRequestSchema.safeParse({
      ...body,
      paymentMethod: "WHATSAPP",
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
    await sendOrderReceivedEmail(order.id).catch((error) => {
      console.error("WhatsApp order receipt email error:", error)
    })
    const whatsappUrl = buildOrderWhatsAppLink(order, checkoutItems)

    return NextResponse.json({
      url: whatsappUrl,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error("WhatsApp Checkout Error:", error)

    if (error instanceof CouponValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos crear la orden.",
        }),
      },
      { status: 500 }
    )
  }
}
