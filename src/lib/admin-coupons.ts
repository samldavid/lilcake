import { Prisma } from "@prisma/client"
import { z } from "zod"
import { normalizeCouponCode } from "@/lib/coupons"

export const adminCouponPayloadSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "El codigo debe tener al menos 3 caracteres.")
      .max(32, "El codigo no puede superar 32 caracteres.")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Usa solo letras, numeros, guiones o guion bajo."
      )
      .transform(normalizeCouponCode),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().positive("El descuento debe ser mayor a 0."),
    minPurchase: z
      .number()
      .nonnegative("La compra minima no puede ser negativa.")
      .nullable()
      .optional()
      .transform((value) => (value && value > 0 ? value : null)),
    maxUses: z
      .number()
      .int("El limite de uso debe ser un entero.")
      .positive("El limite de uso debe ser mayor a 0.")
      .nullable()
      .optional()
      .transform((value) => (value && value > 0 ? value : null)),
    maxUsesPerUser: z
      .number()
      .int("El limite por cliente debe ser un entero.")
      .positive("El limite por cliente debe ser mayor a 0.")
      .nullable()
      .optional()
      .transform((value) => (value && value > 0 ? value : null)),
    isActive: z.boolean().default(true),
    expiresAt: z
      .string()
      .trim()
      .nullable()
      .optional()
      .transform((value, ctx) => {
        if (!value) {
          return null
        }

        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La fecha de expiracion no es valida.",
          })

          return z.NEVER
        }

        return date
      }),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PERCENTAGE" && data.value > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Un cupon porcentual no puede superar el 100%.",
      })
    }

    if (
      data.maxUses !== null &&
      data.maxUsesPerUser !== null &&
      data.maxUsesPerUser > data.maxUses
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxUsesPerUser"],
        message: "El limite por cliente no puede superar el limite global.",
      })
    }
  })

export type AdminCouponPayload = z.infer<typeof adminCouponPayloadSchema>

export const adminCouponSelect = {
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
  createdAt: true,
  orders: {
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      total: true,
    },
  },
} satisfies Prisma.CouponSelect

export type AdminCouponRecord = Prisma.CouponGetPayload<{
  select: typeof adminCouponSelect
}>

export type AdminCouponRow = {
  id: string
  code: string
  type: "PERCENTAGE" | "FIXED"
  value: number
  minPurchase: number | null
  maxUses: number | null
  maxUsesPerUser: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
  totalOrders: number
  paidOrders: number
  pendingOrders: number
  cancelledOrders: number
  paidRevenue: number
}

export function serializeAdminCoupon(coupon: AdminCouponRecord): AdminCouponRow {
  const paidOrders = coupon.orders.filter((order) => order.paymentStatus === "PAID")
  const pendingOrders = coupon.orders.filter((order) => order.status === "PENDING")
  const cancelledOrders = coupon.orders.filter((order) => order.status === "CANCELLED")

  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type as "PERCENTAGE" | "FIXED",
    value: coupon.value,
    minPurchase: coupon.minPurchase,
    maxUses: coupon.maxUses,
    maxUsesPerUser: coupon.maxUsesPerUser,
    usedCount: coupon.usedCount,
    isActive: coupon.isActive,
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
    createdAt: coupon.createdAt.toISOString(),
    totalOrders: coupon.orders.length,
    paidOrders: paidOrders.length,
    pendingOrders: pendingOrders.length,
    cancelledOrders: cancelledOrders.length,
    paidRevenue: paidOrders.reduce((acc, order) => acc + order.total, 0),
  }
}
