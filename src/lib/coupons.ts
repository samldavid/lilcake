import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getStripe, getStripeUnitAmount } from "@/lib/stripe"

const COUPON_RESERVATION_TTL_MS = 30 * 60 * 1000
const MAX_ACTIVE_COUPON_RESERVATIONS_PER_USER = 3

const couponSelect = {
  id: true,
  code: true,
  type: true,
  value: true,
  minPurchase: true,
  maxUses: true,
  maxUsesPerUser: true,
  usedCount: true,
  isActive: true,
  expiresAt: true,
} satisfies Prisma.CouponSelect

type CouponDbClient = Prisma.TransactionClient | typeof prisma

export type CouponSnapshot = Prisma.CouponGetPayload<{
  select: typeof couponSelect
}>

export type CouponBreakdown = {
  coupon: CouponSnapshot
  subtotal: number
  discount: number
  total: number
}

export class CouponValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CouponValidationError"
  }
}

type CouponReservationOrder = {
  id: string
  couponId: string | null
  userId: string
  couponReservedAt: Date | null
  couponConsumedAt: Date | null
}

function roundCurrency(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase()
}

export function calculateCouponDiscount(
  coupon: Pick<CouponSnapshot, "type" | "value">,
  subtotal: number
) {
  if (subtotal <= 0) {
    return 0
  }

  const rawDiscount =
    coupon.type === "PERCENTAGE"
      ? (subtotal * coupon.value) / 100
      : coupon.value

  return roundCurrency(Math.min(subtotal, rawDiscount))
}

function assertCouponAvailability(
  coupon: CouponSnapshot | null,
  subtotal: number,
  userUsageCount = 0,
  now = new Date()
): asserts coupon is CouponSnapshot {
  if (!coupon) {
    throw new CouponValidationError("No encontramos un cupon valido con ese codigo.")
  }

  if (!coupon.isActive) {
    throw new CouponValidationError("Este cupon no esta activo en este momento.")
  }

  if (coupon.expiresAt && coupon.expiresAt <= now) {
    throw new CouponValidationError("Este cupon ya vencio.")
  }

  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    throw new CouponValidationError(
      `Este cupon requiere una compra minima de ${coupon.minPurchase.toLocaleString("es-CO")} COP.`
    )
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new CouponValidationError("Este cupon ya alcanzo su limite de uso.")
  }

  if (coupon.maxUsesPerUser !== null && userUsageCount >= coupon.maxUsesPerUser) {
    throw new CouponValidationError(
      "Ya alcanzaste el limite de uso permitido para este cupon."
    )
  }

  const discount = calculateCouponDiscount(coupon, subtotal)

  if (discount <= 0) {
    throw new CouponValidationError("Este cupon no aplica descuento sobre tu pedido actual.")
  }
}

export async function resolveCouponForSubtotal(
  db: CouponDbClient,
  couponCode: string,
  subtotal: number,
  userId?: string
): Promise<CouponBreakdown> {
  const normalizedCode = normalizeCouponCode(couponCode)

  if (!normalizedCode) {
    throw new CouponValidationError("Debes ingresar un codigo de descuento.")
  }

  const coupon = await db.coupon.findUnique({
    where: { code: normalizedCode },
    select: couponSelect,
  })

  const userUsageCount =
    coupon && coupon.maxUsesPerUser !== null && userId
      ? (
          await db.couponCustomerUsage.findUnique({
            where: {
              couponId_userId: {
                couponId: coupon.id,
                userId,
              },
            },
            select: {
              usedCount: true,
            },
          })
        )?.usedCount ?? 0
      : 0

  assertCouponAvailability(coupon, subtotal, userUsageCount)

  const discount = calculateCouponDiscount(coupon, subtotal)
  const total = roundCurrency(Math.max(0, subtotal - discount))

  return {
    coupon,
    subtotal: roundCurrency(subtotal),
    discount,
    total,
  }
}

export async function reserveCouponUsage(
  tx: Prisma.TransactionClient,
  coupon: CouponSnapshot,
  userId: string
) {
  const now = new Date()

  await releaseExpiredCouponReservations(tx, coupon.id, now)

  const activeUserReservations = await tx.order.count({
    where: {
      couponId: coupon.id,
      userId,
      paymentStatus: "PENDING",
      status: "PENDING",
      couponReservedAt: {
        not: null,
      },
      couponConsumedAt: null,
    },
  })

  if (activeUserReservations >= MAX_ACTIVE_COUPON_RESERVATIONS_PER_USER) {
    throw new CouponValidationError(
      "Tienes varios pedidos pendientes con este cupon. Finaliza o cancela uno antes de volver a usarlo."
    )
  }

  const result = await tx.coupon.updateMany({
    where: {
      id: coupon.id,
      isActive: true,
      ...(coupon.expiresAt ? { expiresAt: { gt: now } } : {}),
      ...(coupon.maxUses !== null ? { usedCount: { lt: coupon.maxUses } } : {}),
    },
    data: {
      usedCount: {
        increment: 1,
      },
    },
  })

  if (result.count === 0) {
    throw new CouponValidationError("Este cupon dejo de estar disponible. Intenta de nuevo.")
  }

  if (coupon.maxUsesPerUser === null) {
    return {
      reservedAt: now,
    }
  }

  const usage = await tx.couponCustomerUsage.upsert({
    where: {
      couponId_userId: {
        couponId: coupon.id,
        userId,
      },
    },
    create: {
      couponId: coupon.id,
      userId,
      usedCount: 1,
    },
    update: {
      usedCount: {
        increment: 1,
      },
    },
    select: {
      usedCount: true,
    },
  })

  if (usage.usedCount > coupon.maxUsesPerUser) {
    throw new CouponValidationError(
      "Ya alcanzaste el limite de uso permitido para este cupon."
    )
  }

  return {
    reservedAt: now,
  }
}

export async function releaseCouponUsage(
  tx: Prisma.TransactionClient,
  couponId: string | null | undefined,
  userId?: string | null
) {
  if (!couponId) {
    return
  }

  await tx.coupon.updateMany({
    where: {
      id: couponId,
      usedCount: {
        gt: 0,
      },
    },
    data: {
      usedCount: {
        decrement: 1,
      },
    },
  })

  if (!userId) {
    return
  }

  await tx.couponCustomerUsage.updateMany({
    where: {
      couponId,
      userId,
      usedCount: {
        gt: 0,
      },
    },
    data: {
      usedCount: {
        decrement: 1,
      },
    },
  })
}

export async function releaseCouponReservationForOrder(
  tx: Prisma.TransactionClient,
  order: CouponReservationOrder
) {
  if (!order.couponId || !order.couponReservedAt || order.couponConsumedAt) {
    return false
  }

  await releaseCouponUsage(tx, order.couponId, order.userId)
  await tx.order.update({
    where: { id: order.id },
    data: {
      couponReservedAt: null,
    },
  })

  return true
}

export async function ensureCouponReservationForOrder(
  tx: Prisma.TransactionClient,
  order: CouponReservationOrder
) {
  if (!order.couponId || order.couponReservedAt || order.couponConsumedAt) {
    return null
  }

  const coupon = await tx.coupon.findUnique({
    where: { id: order.couponId },
    select: couponSelect,
  })

  if (!coupon) {
    throw new CouponValidationError("No encontramos el cupon asociado al pedido.")
  }

  const reservation = await reserveCouponUsage(tx, coupon, order.userId)

  await tx.order.update({
    where: { id: order.id },
    data: {
      couponReservedAt: reservation.reservedAt,
    },
  })

  return reservation
}

async function releaseExpiredCouponReservations(
  tx: Prisma.TransactionClient,
  couponId: string,
  now: Date
) {
  const expiresBefore = new Date(now.getTime() - COUPON_RESERVATION_TTL_MS)
  const expiredReservations = await tx.order.findMany({
    where: {
      couponId,
      paymentStatus: "PENDING",
      status: "PENDING",
      couponReservedAt: {
        lt: expiresBefore,
      },
      couponConsumedAt: null,
    },
    select: {
      id: true,
      couponId: true,
      userId: true,
      couponReservedAt: true,
      couponConsumedAt: true,
    },
  })

  for (const reservation of expiredReservations) {
    await releaseCouponReservationForOrder(tx, reservation)
  }
}

export async function createStripeDiscountCoupon(options: {
  currency: string
  couponCode: string
  discountAmount: number
  orderNumber: string
}) {
  if (options.discountAmount <= 0) {
    return null
  }

  return getStripe().coupons.create({
    amount_off: getStripeUnitAmount(options.discountAmount, options.currency),
    currency: options.currency,
    duration: "once",
    name: `Descuento ${options.couponCode}`,
    metadata: {
      localCouponCode: options.couponCode,
      orderNumber: options.orderNumber,
    },
  })
}
