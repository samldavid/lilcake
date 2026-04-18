import { prisma } from "@/lib/prisma"
import { productVariantSchema, createProductSchema } from "@/lib/validations"
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

export const adminProductPayloadSchema = createProductSchema.extend({
  images: z.array(adminImageReferenceSchema).min(1, "Debes agregar al menos una imagen"),
  variants: z
    .array(productVariantSchema.extend({ id: z.string().optional() }))
    .min(1, "Debes agregar al menos una variante"),
})

export type AdminProductPayload = z.infer<typeof adminProductPayloadSchema>

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
    throw new Error("Ya existe otro producto con un nombre muy similar.")
  }

  return slug
}
