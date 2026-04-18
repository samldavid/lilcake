import { z } from "zod"

// ──────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
})

// ──────────────────────────────────────────────
// PRODUCTS
// ──────────────────────────────────────────────

export const productVariantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  sku: z.string().min(1, "SKU requerido"),
  stock: z.number().int().min(0, "Stock no puede ser negativo"),
  priceOverride: z.number().positive().optional().nullable(),
})

export const createProductSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().min(1, "Descripción requerida"),
  price: z.number().positive("Precio debe ser positivo"),
  compareAtPrice: z.number().positive().optional().nullable(),
  categoryId: z.string().min(1, "Categoría requerida"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string().url("URL de imagen inválida")).optional(),
  variants: z.array(productVariantSchema).optional(),
})

export const updateProductSchema = createProductSchema.partial()

// ──────────────────────────────────────────────
// ORDERS
// ──────────────────────────────────────────────

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        productName: z.string(),
        productSize: z.string().optional(),
        productColor: z.string().optional(),
      })
    )
    .min(1, "Debes agregar al menos un producto"),
  shippingName: z.string().min(2, "Nombre de envío requerido"),
  shippingAddress: z.string().min(5, "Dirección requerida"),
  shippingCity: z.string().min(2, "Ciudad requerida"),
  shippingPhone: z.string().min(7, "Teléfono requerido"),
  paymentMethod: z.enum(["STRIPE", "TRANSFER", "ADDI", "WHATSAPP"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
})

export const updateOrderSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED"]).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

// ──────────────────────────────────────────────
// CATEGORIES
// ──────────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  image: z.string().url().optional().nullable(),
  sortOrder: z.number().int().default(0),
})

// ──────────────────────────────────────────────
// COUPONS
// ──────────────────────────────────────────────

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Código debe tener al menos 3 caracteres")
    .transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("Valor debe ser positivo"),
  minPurchase: z.number().positive().optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
})

// ──────────────────────────────────────────────
// VALIDATE COUPON
// ──────────────────────────────────────────────

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Código requerido"),
  subtotal: z.number().positive(),
})
