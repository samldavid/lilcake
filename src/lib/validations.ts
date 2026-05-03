import { z } from "zod"
import { getPasswordValidationErrors } from "@/lib/password-policy"

// AUTH

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    phone: z.string().optional(),
    acceptedTerms: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const passwordErrors = getPasswordValidationErrors(data.password, [
      data.name,
      data.email,
    ])

    for (const message of passwordErrors) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message,
      })
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
      })
    }

    if (!data.acceptedTerms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["acceptedTerms"],
        message: "Debes aceptar los terminos y condiciones para crear tu cuenta",
      })
    }
  })

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(1, "La nueva contraseña es obligatoria"),
    confirmPassword: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .superRefine((data, ctx) => {
    const passwordErrors = getPasswordValidationErrors(data.newPassword)

    for (const message of passwordErrors) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message,
      })
    }

    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
      })
    }
  })

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "El enlace no es válido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .superRefine((data, ctx) => {
    const passwordErrors = getPasswordValidationErrors(data.password)

    for (const message of passwordErrors) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message,
      })
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
      })
    }
  })

// PRODUCTS

export const productVariantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  sku: z.string().min(1, "SKU requerido"),
  stock: z.number().int().min(0, "Stock no puede ser negativo"),
  priceOverride: z.number().positive().optional().nullable(),
})

export const createProductSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().min(1, "Descripcion requerida"),
  price: z.number().positive("Precio debe ser positivo"),
  compareAtPrice: z.number().positive().optional().nullable(),
  categoryId: z.string().min(1, "Categoria requerida"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.string().url("URL de imagen invalida")).optional(),
  variants: z.array(productVariantSchema).optional(),
})

export const updateProductSchema = createProductSchema.partial()

// ORDERS

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
  shippingName: z.string().min(2, "Nombre de envio requerido"),
  customerEmail: z.string().email("Email invalido").optional(),
  shippingAddress: z.string().min(5, "Direccion requerida"),
  shippingCity: z.string().min(2, "Ciudad requerida"),
  shippingPhone: z.string().min(7, "Telefono requerido"),
  paymentMethod: z.enum(["STRIPE", "WOMPI", "TRANSFER", "ADDI", "WHATSAPP"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
})

export const updateOrderSchema = z.object({
  status: z
    .enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED"]).optional(),
  shippingCarrier: z.string().max(120, "La transportadora es demasiado larga").optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

// CATEGORIES

export const categorySchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  image: z.string().url().optional().nullable(),
  sortOrder: z.number().int().default(0),
})

// COUPONS

export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Codigo debe tener al menos 3 caracteres")
    .transform((value) => value.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("Valor debe ser positivo"),
  minPurchase: z.number().positive().optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
})

// VALIDATE COUPON

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Codigo requerido"),
  subtotal: z.number().positive(),
})
