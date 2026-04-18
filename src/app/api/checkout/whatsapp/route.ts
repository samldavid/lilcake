import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  buildOrderWhatsAppLink,
  checkoutRequestSchema,
  createPendingOrder,
  prepareCheckoutItems,
} from "@/lib/checkout"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesion" }, { status: 401 })
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
    const whatsappUrl = buildOrderWhatsAppLink(order, checkoutItems)

    return NextResponse.json({
      url: whatsappUrl,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos crear la orden"

    console.error("WhatsApp Checkout Error:", error)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
