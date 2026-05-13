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
import {
  CouponValidationError,
  createStripeDiscountCoupon,
  ensureCouponReservationForOrder,
} from "@/lib/coupons"
import { getPublicErrorMessage } from "@/lib/errors"
import { createOrReuseWompiCheckout } from "@/lib/wompi-payments"
import { isWompiCheckoutEnabled } from "@/lib/wompi"
import { getTrustedAppOrigin } from "@/lib/app-url"
import {
  consumeCheckoutRateLimit,
  createCheckoutRateLimitResponse,
} from "@/lib/checkout-rate-limit"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesion." }, { status: 401 })
    }

    const rateLimit = consumeCheckoutRateLimit(req, session.user.id, "resume")

    if (!rateLimit.allowed) {
      return createCheckoutRateLimitResponse(rateLimit.retryAfterSeconds)
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

    if (order.paymentMethod === "WOMPI") {
      if (!isWompiCheckoutEnabled()) {
        return NextResponse.json(
          { error: "Wompi no esta disponible en este entorno todavia." },
          { status: 503 }
        )
      }

      await prisma.$transaction(async (tx) => {
        await ensureCouponReservationForOrder(tx, {
          id: order.id,
          couponId: order.couponId,
          userId: order.userId,
          couponReservedAt: order.couponReservedAt,
          couponConsumedAt: order.couponConsumedAt,
        })
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "PENDING" },
        })
      })

      const { url, reference } = await createOrReuseWompiCheckout({
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          customerEmail: order.customerEmail,
          shippingName: order.shippingName,
          shippingPhone: order.shippingPhone,
        },
        origin: getTrustedAppOrigin(req.url),
      })

      return NextResponse.json({
        url,
        orderNumber: order.orderNumber,
        reference,
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

    await prisma.$transaction(async (tx) => {
      await ensureCouponReservationForOrder(tx, {
        id: order.id,
        couponId: order.couponId,
        userId: order.userId,
        couponReservedAt: order.couponReservedAt,
        couponConsumedAt: order.couponConsumedAt,
      })
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PENDING" },
      })
    })

    const origin = getTrustedAppOrigin(req.url)
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
        stripeSessionId: checkoutSession.id,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error("Resume order error:", error)

    if (error instanceof CouponValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos continuar el pedido.",
        }),
      },
      { status: 500 }
    )
  }
}
