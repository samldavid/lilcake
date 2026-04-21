import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import {
  getStripe,
  getStripeProductImages,
  getStripeUnitAmount,
  isStripeEnabled,
} from "@/lib/stripe"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buildOrderWhatsAppLink, type PreparedCheckoutItem } from "@/lib/checkout"
import { canCustomerResumeOrder } from "@/lib/order-status"
import { createStripeDiscountCoupon } from "@/lib/coupons"

export async function POST(
  req: Request,
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
      include: {
        coupon: {
          select: {
            code: true,
          },
        },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      orderBy: { sortOrder: "asc" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "No encontramos el pedido." },
        { status: 404 }
      )
    }

    if (!canCustomerResumeOrder(order)) {
      return NextResponse.json(
        { error: "Este pedido ya no se puede continuar." },
        { status: 400 }
      )
    }

    const preparedItems: PreparedCheckoutItem[] = order.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      productId: item.variant.productId,
      productName: item.productName,
      productSlug: item.variant.product.slug,
      productSize: item.productSize,
      productColor: item.productColor,
      unitPrice: item.unitPrice,
      image: item.variant.product.images[0]?.url ?? "",
    }))

    if (order.paymentMethod === "WHATSAPP") {
      return NextResponse.json({
        url: buildOrderWhatsAppLink(order, preparedItems),
        orderNumber: order.orderNumber,
      })
    }

    if (order.paymentMethod !== "STRIPE") {
      return NextResponse.json(
        { error: "Este metodo de pago no se puede reintentar desde la cuenta." },
        { status: 400 }
      )
    }

    if (!isStripeEnabled()) {
      return NextResponse.json(
        { error: "Stripe no esta disponible en este entorno todavia." },
        { status: 503 }
      )
    }

    const origin = new URL(req.url).origin
    const stripeCurrency = "cop"
    const stripeDiscountCoupon =
      order.discount > 0
        ? await createStripeDiscountCoupon({
            currency: stripeCurrency,
            couponCode: order.coupon?.code || "DESCUENTO",
            discountAmount: order.discount,
            orderNumber: order.orderNumber,
          })
        : null

    const lineItems = preparedItems.map((item) => ({
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
      cancel_url: `${origin}/cuenta/pedidos/${order.id}?canceled=true`,
      customer_email: session.user.email,
      ...(stripeDiscountCoupon
        ? {
            discounts: [{ coupon: stripeDiscountCoupon.id }],
          }
        : {}),
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session.user.id,
        couponCode: order.coupon?.code || "",
        discountAmount: `${order.discount}`,
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PENDING",
        stripeSessionId: checkoutSession.id,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos continuar el pedido."

    console.error("Resume order error:", error)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
