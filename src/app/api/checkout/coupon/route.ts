import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prepareCheckoutItems } from "@/lib/checkout"
import { CouponValidationError, resolveCouponForSubtotal } from "@/lib/coupons"
import { prisma } from "@/lib/prisma"

const previewCouponSchema = z.object({
  couponCode: z.string().trim().min(3, "Ingresa un codigo valido."),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, "Variante requerida."),
        quantity: z.number().int().positive("Cantidad invalida."),
      })
    )
    .min(1, "Debes enviar al menos un producto."),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Debes iniciar sesion." }, { status: 401 })
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
    const message =
      error instanceof Error ? error.message : "No pudimos validar el cupon."

    console.error("Coupon preview error:", error)

    return NextResponse.json(
      { error: message },
      { status: error instanceof CouponValidationError ? 400 : 500 }
    )
  }
}
