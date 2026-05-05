import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  CHECKOUT_MAX_ITEMS,
  CHECKOUT_MAX_QUANTITY,
  prepareCheckoutItems,
} from "@/lib/checkout"
import { CouponValidationError, resolveCouponForSubtotal } from "@/lib/coupons"
import { prisma } from "@/lib/prisma"
import {
  buildRateLimitKey,
  consumeRateLimit,
  createRateLimitResponse,
  getRequestIp,
} from "@/lib/rate-limit"
import { getPublicErrorMessage } from "@/lib/errors"

const previewCouponSchema = z.object({
  couponCode: z
    .string()
    .trim()
    .min(3, "Ingresa un codigo valido.")
    .max(40, "El codigo de cupon es demasiado largo."),
  items: z
    .array(
      z.object({
        variantId: z.string().trim().min(1, "Variante requerida.").max(100),
        quantity: z
          .number()
          .int()
          .positive("Cantidad invalida.")
          .max(CHECKOUT_MAX_QUANTITY, "Cantidad demasiado alta."),
      })
    )
    .min(1, "Debes enviar al menos un producto.")
    .max(CHECKOUT_MAX_ITEMS, "Demasiados productos para validar."),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesion." }, { status: 401 })
    }

    const rateLimit = consumeRateLimit({
      key: buildRateLimitKey("checkout-coupon", [
        session.user.id,
        getRequestIp(req),
      ]),
      limit: 15,
      windowMs: 10 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        rateLimit.retryAfterSeconds,
        "Hiciste demasiadas validaciones de cupon. Intenta de nuevo en unos minutos."
      )
    }

    const body = await req.json()
    const result = previewCouponSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Datos invalidos." },
        { status: 400 }
      )
    }

    const checkoutItems = await prepareCheckoutItems(result.data.items)
    const subtotal = checkoutItems.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0
    )
    const couponBreakdown = await resolveCouponForSubtotal(
      prisma,
      result.data.couponCode,
      subtotal,
      session.user.id
    )

    return NextResponse.json({
      code: couponBreakdown.coupon.code,
      type: couponBreakdown.coupon.type,
      value: couponBreakdown.coupon.value,
      subtotal: couponBreakdown.subtotal,
      discount: couponBreakdown.discount,
      total: couponBreakdown.total,
      minPurchase: couponBreakdown.coupon.minPurchase,
      maxUsesPerUser: couponBreakdown.coupon.maxUsesPerUser,
      expiresAt: couponBreakdown.coupon.expiresAt?.toISOString() ?? null,
    })
  } catch (error) {
    console.error("Coupon preview error:", error)

    if (error instanceof CouponValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos validar el cupon.",
        }),
      },
      { status: 500 }
    )
  }
}
