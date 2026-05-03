import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { buildWhatsAppLink, formatCOP, generateOrderNumber } from "@/lib/utils"
import {
  releaseCouponUsage,
  reserveCouponUsage,
  resolveCouponForSubtotal,
} from "@/lib/coupons"
import { z } from "zod"

const checkoutItemSchema = z.object({
  variantId: z.string().min(1, "Variante requerida"),
  quantity: z.number().int().positive("Cantidad invalida"),
})

export const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Debes agregar al menos un producto"),
  customerEmail: z.string().email("Email invalido"),
  shippingName: z.string().min(2, "Nombre requerido"),
  shippingAddress: z.string().min(5, "Direccion requerida"),
  shippingCity: z.string().min(2, "Ciudad requerida"),
  shippingPhone: z.string().min(7, "Telefono requerido"),
  paymentMethod: z.enum(["STRIPE", "WOMPI", "WHATSAPP"]),
  couponCode: z.string().trim().min(3, "Ingresa un codigo valido").optional(),
  notes: z.string().trim().optional(),
  acceptedTerms: z
    .boolean()
    .refine(
      (value) => value,
      "Debes aceptar los terminos y condiciones antes de confirmar la compra"
    ),
})

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>

export type PreparedCheckoutItem = {
  variantId: string
  quantity: number
  productId: string
  productName: string
  productSlug: string
  productSize: string | null
  productColor: string | null
  unitPrice: number
  image: string
}

export async function prepareCheckoutItems(
  items: CheckoutRequest["items"]
): Promise<PreparedCheckoutItem[]> {
  const variantIds = [...new Set(items.map((item) => item.variantId))]

  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: variantIds },
      product: { isActive: true },
    },
    include: {
      product: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
  })

  if (variants.length !== variantIds.length) {
    throw new Error("Uno o mas productos ya no estan disponibles.")
  }

  const variantMap = new Map(variants.map((variant) => [variant.id, variant]))

  return items.map((item) => {
    const variant = variantMap.get(item.variantId)

    if (!variant) {
      throw new Error("No pudimos encontrar una de las variantes seleccionadas.")
    }

    if (variant.stock < item.quantity) {
      throw new Error(`No hay suficiente stock para ${variant.product.name}.`)
    }

    return {
      variantId: variant.id,
      quantity: item.quantity,
      productId: variant.productId,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      productSize: variant.size,
      productColor: variant.color,
      unitPrice: variant.priceOverride ?? variant.product.price,
      image: variant.product.images[0]?.url ?? "",
    }
  })
}

async function createUniqueOrderNumber(tx: Prisma.TransactionClient) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderNumber = generateOrderNumber()
    const existingOrder = await tx.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    })

    if (!existingOrder) {
      return orderNumber
    }
  }

  throw new Error("No pudimos generar un numero unico para la orden.")
}

function roundCurrency(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export async function createPendingOrder(
  userId: string,
  payload: CheckoutRequest,
  items: PreparedCheckoutItem[]
) {
  const subtotal = roundCurrency(items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  ))

  return prisma.$transaction(async (tx) => {
    const orderNumber = await createUniqueOrderNumber(tx)
    const couponBreakdown = payload.couponCode?.trim()
      ? await resolveCouponForSubtotal(tx, payload.couponCode, subtotal, userId)
      : null

    if (couponBreakdown) {
      await reserveCouponUsage(tx, couponBreakdown.coupon, userId)
    }

    return tx.order.create({
      data: {
        orderNumber,
        userId,
        customerEmail: payload.customerEmail.trim().toLowerCase(),
        subtotal,
        discount: couponBreakdown?.discount ?? 0,
        total: couponBreakdown?.total ?? subtotal,
        shippingName: payload.shippingName.trim(),
        shippingAddress: payload.shippingAddress.trim(),
        shippingCity: payload.shippingCity.trim(),
        shippingPhone: payload.shippingPhone.trim(),
        paymentMethod: payload.paymentMethod,
        paymentStatus: "PENDING",
        couponId: couponBreakdown?.coupon.id ?? null,
        notes: payload.notes?.trim() || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            productSize: item.productSize,
            productColor: item.productColor,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    })
  })
}

function mergeOrderNotes(...notes: Array<string | null | undefined>) {
  const mergedNotes = notes
    .map((note) => note?.trim())
    .filter(Boolean)

  return mergedNotes.length > 0 ? mergedNotes.join("\n") : null
}

export async function releaseOrderCouponReservation(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        couponId: true,
        userId: true,
        status: true,
        paymentStatus: true,
      },
    })

    if (!order) {
      throw new Error("No encontramos la orden para actualizar el cupon.")
    }

    if (order.couponId && order.status !== "CANCELLED" && order.paymentStatus !== "PAID") {
      await releaseCouponUsage(tx, order.couponId, order.userId)
    }

    return order
  })
}

export async function markOrderPaymentFailed(
  orderId: string,
  reason: string,
  stripeSessionId?: string | null
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        notes: true,
        couponId: true,
        userId: true,
        paymentStatus: true,
      },
    })

    if (!order) {
      throw new Error("No encontramos la orden que se debe actualizar.")
    }

    if (order.paymentStatus !== "PAID" && order.paymentStatus !== "FAILED") {
      await releaseCouponUsage(tx, order.couponId, order.userId)
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "FAILED",
        stripeSessionId: stripeSessionId ?? undefined,
        notes: mergeOrderNotes(order.notes, reason),
      },
      select: {
        id: true,
        orderNumber: true,
        paymentStatus: true,
        status: true,
      },
    })
  })
}

export async function finalizePaidOrder(orderId: string) {
  return prisma.$transaction(async (tx) => {
    // Prevent duplicate stock adjustments if the webhook and the return flow
    // try to finalize the same order at the same time.
    await tx.$queryRaw`
      SELECT "id"
      FROM "Order"
      WHERE "id" = ${orderId}
      FOR UPDATE
    `

    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        orderNumber: true,
        paymentStatus: true,
        status: true,
        confirmedAt: true,
        notes: true,
        items: {
          select: {
            variantId: true,
            quantity: true,
            productName: true,
          },
        },
      },
    })

    if (!order) {
      throw new Error("No encontramos la orden asociada al pago.")
    }

    if (order.paymentStatus === "PAID") {
      return {
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        status: order.status,
      }
    }

    const stockAlerts: string[] = []

    for (const item of order.items) {
      const updatedStock = await tx.productVariant.updateMany({
        where: {
          id: item.variantId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })

      if (updatedStock.count === 0) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: 0 },
        })

        stockAlerts.push(item.productName)
      }
    }

    await tx.cartItem.deleteMany({
      where: { userId: order.userId },
    })

    await tx.user.update({
      where: { id: order.userId },
      data: {
        cartVersion: {
          increment: 1,
        },
      },
    })

    const nextNotes = stockAlerts.length
      ? [
          order.notes?.trim(),
          `Ajuste automatico de stock aplicado al confirmar pago. Revisar inventario de: ${stockAlerts.join(", ")}.`,
        ]
          .filter(Boolean)
          .join("\n")
      : order.notes

    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: order.status === "PENDING" ? "CONFIRMED" : order.status,
        confirmedAt: order.confirmedAt ?? new Date(),
        notes: nextNotes || null,
      },
      select: {
        orderNumber: true,
        paymentStatus: true,
        status: true,
      },
    })

    return updatedOrder
  })
}

export function buildOrderWhatsAppLink(
  order: {
    orderNumber: string
    discount?: number | null
    total: number
    shippingName: string
    shippingAddress?: string
    shippingCity: string
    shippingPhone?: string
  },
  items: PreparedCheckoutItem[]
) {
  const itemLines = items.map((item) => {
    const variantLabel = [item.productSize, item.productColor]
      .filter(Boolean)
      .join(" - ")

    return `- ${item.productName}${variantLabel ? ` (${variantLabel})` : ""} x${item.quantity}`
  })

  const message = [
    `Hola, quiero coordinar el pedido ${order.orderNumber}.`,
    "Metodo solicitado: contraentrega o asesoria para Addi/otro metodo.",
    `Nombre: ${order.shippingName}`,
    ...(order.shippingAddress ? [`Direccion: ${order.shippingAddress}`] : []),
    `Ciudad: ${order.shippingCity}`,
    ...(order.shippingPhone ? [`Telefono: ${order.shippingPhone}`] : []),
    ...(order.discount && order.discount > 0
      ? [`Descuento aplicado: ${formatCOP(order.discount)}`]
      : []),
    `Total: ${formatCOP(order.total)}`,
    "Productos:",
    ...itemLines,
  ].join("\n")

  return buildWhatsAppLink(message)
}
