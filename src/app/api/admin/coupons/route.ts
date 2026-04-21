import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import {
  adminCouponPayloadSchema,
  adminCouponSelect,
  serializeAdminCoupon,
} from "@/lib/admin-coupons"
import {
  adminNotFoundResponse,
  requireAdminApiSession,
} from "@/lib/auth-guards"
import { getPublicErrorMessage } from "@/lib/errors"

export async function GET() {
  try {
    const session = await requireAdminApiSession()

    if (!session) {
      return adminNotFoundResponse()
    }

    const coupons = await prisma.coupon.findMany({
      select: adminCouponSelect,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(coupons.map(serializeAdminCoupon))
  } catch (error) {
    console.error("Admin coupons GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdminApiSession()

    if (!session) {
      return adminNotFoundResponse()
    }

    const body = await req.json()
    const result = adminCouponPayloadSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Datos invalidos." },
        { status: 400 }
      )
    }

    const data = result.data
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: data.code },
      select: { id: true },
    })

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Ya existe un cupon con ese codigo." },
        { status: 409 }
      )
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minPurchase: data.minPurchase,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        isActive: data.isActive,
        expiresAt: data.expiresAt,
      },
      select: adminCouponSelect,
    })

    revalidatePath("/admin/cupones")

    return NextResponse.json(serializeAdminCoupon(coupon), { status: 201 })
  } catch (error) {
    console.error("Admin coupons POST error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos crear el cupon.",
        }),
      },
      { status: 500 }
    )
  }
}
