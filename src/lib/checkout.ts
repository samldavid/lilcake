import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { buildWhatsAppLink, formatCOP, generateOrderNumber } from "@/lib/utils"
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
  paymentMethod: z.enum(["STRIPE", "WHATSAPP"]),
  notes: z.string().trim().optional(),
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

export async function createPendingOrder(
  userId: string,
  payload: CheckoutRequest,
  items: PreparedCheckoutItem[]
) {
  const subtotal = items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  )

  return prisma.$transaction(async (tx) => {
    const orderNumber = await createUniqueOrderNumber(tx)

    return tx.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        total: subtotal,
        shippingName: payload.shippingName.trim(),
        shippingAddress: payload.shippingAddress.trim(),
        shippingCity: payload.shippingCity.trim(),
        shippingPhone: payload.shippingPhone.trim(),
        paymentMethod: payload.paymentMethod,
        paymentStatus: "PENDING",
        notes: payload.notes?.trim() || null,
        items: {
          create: items.map((item) => ({
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

export function buildOrderWhatsAppLink(
  order: {
    orderNumber: string
    total: number
    shippingName: string
    shippingCity: string
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
    `Hola, quiero confirmar el pedido ${order.orderNumber}.`,
    `Nombre: ${order.shippingName}`,
    `Ciudad: ${order.shippingCity}`,
    `Total: ${formatCOP(order.total)}`,
    "Productos:",
    ...itemLines,
  ].join("\n")

  return buildWhatsAppLink(message)
}
