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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApiSession()

    if (!session) {
      return adminNotFoundResponse()
    }

    const { id } = await params
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      select: adminCouponSelect,
    })

    if (!coupon) {
      return NextResponse.json(
        { error: "No encontramos el cupon." },
        { status: 404 }
      )
    }

    return NextResponse.json(serializeAdminCoupon(coupon))
  } catch (error) {
    console.error("Admin coupon GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApiSession()

    if (!session) {
      return adminNotFoundResponse()
    }

    const { id } = await params
    const body = await req.json()
    const result = adminCouponPayloadSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Datos invalidos." },
        { status: 400 }
      )
    }

    const currentCoupon = await prisma.coupon.findUnique({
      where: { id },
      select: { id: true, code: true, usedCount: true },
    })

    if (!currentCoupon) {
      return NextResponse.json(
        { error: "No encontramos el cupon." },
        { status: 404 }
      )
    }

    const data = result.data
    const conflictingCoupon = await prisma.coupon.findFirst({
      where: {
        code: data.code,
        id: { not: id },
      },
      select: { id: true },
    })

    if (conflictingCoupon) {
      return NextResponse.json(
        { error: "Ya existe otro cupon con ese codigo." },
        { status: 409 }
      )
    }

    if (data.maxUses !== null && data.maxUses < currentCoupon.usedCount) {
      return NextResponse.json(
        {
          error:
            "El limite de usos no puede quedar por debajo de los usos ya reservados o consumidos.",
        },
        { status: 400 }
      )
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
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

    return NextResponse.json(serializeAdminCoupon(updatedCoupon))
  } catch (error) {
    console.error("Admin coupon PUT error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos actualizar el cupon.",
        }),
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApiSession()

    if (!session) {
      return adminNotFoundResponse()
    }

    const { id } = await params
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!coupon) {
      return NextResponse.json(
        { error: "No encontramos el cupon." },
        { status: 404 }
      )
    }

    if (coupon._count.orders > 0) {
      return NextResponse.json(
        {
          error:
            "Este cupon ya tiene pedidos asociados. Desactivalo en lugar de eliminarlo.",
        },
        { status: 400 }
      )
    }

    await prisma.coupon.delete({
      where: { id },
    })

    revalidatePath("/admin/cupones")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin coupon DELETE error:", error)

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos eliminar el cupon.",
        }),
      },
      { status: 500 }
    )
  }
}
