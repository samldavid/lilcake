import { prisma } from "@/lib/prisma"
import {
  productBaseSchema,
  productVariantSchema,
  validateProductPriceComparison,
} from "@/lib/validations"
import { slugify } from "@/lib/utils"
import {
  isValidProductImageReference,
  normalizeProductImageReference,
} from "@/lib/image-utils"
import { z } from "zod"

export const adminImageReferenceSchema = z
  .string()
  .trim()
  .min(1, "Debes agregar una imagen")
  .transform(normalizeProductImageReference)
  .refine(
    isValidProductImageReference,
    "Usa una URL valida o una ruta publica como /images/foto.png"
  )

export const adminProductPayloadSchema = productBaseSchema
  .extend({
    images: z.array(adminImageReferenceSchema).min(1, "Debes agregar al menos una imagen"),
    variants: z
      .array(productVariantSchema.extend({ id: z.string().optional() }))
      .min(1, "Debes agregar al menos una variante"),
  })
  .superRefine(validateProductPriceComparison)

export type AdminProductPayload = z.infer<typeof adminProductPayloadSchema>

export class AdminProductConflictError extends Error {
  status = 409

  constructor(message: string) {
    super(message)
    this.name = "AdminProductConflictError"
  }
}

export async function ensureUniqueProductSlug(name: string, productId?: string) {
  const slug = slugify(name)

  const existingProduct = await prisma.product.findFirst({
    where: {
      slug,
      ...(productId ? { id: { not: productId } } : {}),
    },
    select: { id: true },
  })

  if (existingProduct) {
    throw new AdminProductConflictError(
      "Ya existe otro producto con un nombre muy similar."
    )
  }

  return slug
}

type ProductVariantAvailabilityInput = Array<{
  id?: string
  sku: string
}>

export async function ensureVariantSkusAreAvailable(
  variants: ProductVariantAvailabilityInput
) {
  const normalizedSkus = variants
    .map((variant) => variant.sku.trim())
    .filter(Boolean)

  const repeatedSku = normalizedSkus.find(
    (sku, index) => normalizedSkus.indexOf(sku) !== index
  )

  if (repeatedSku) {
    throw new AdminProductConflictError(
      `El SKU ${repeatedSku} esta repetido dentro del mismo producto.`
    )
  }

  if (normalizedSkus.length === 0) {
    return
  }

  const allowedVariantIds = new Set(
    variants
      .map((variant) => variant.id)
      .filter((variantId): variantId is string => Boolean(variantId))
  )

  const existingVariants = await prisma.productVariant.findMany({
    where: {
      sku: { in: normalizedSkus },
    },
    select: {
      id: true,
      sku: true,
    },
  })

  const conflictingVariant = existingVariants.find(
    (variant) => !allowedVariantIds.has(variant.id)
  )

  if (conflictingVariant) {
    throw new AdminProductConflictError(
      `El SKU ${conflictingVariant.sku} ya esta en uso por otra variante.`
    )
  }
}
