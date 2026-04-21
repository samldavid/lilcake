import { randomBytes } from "crypto"

/**
 * Format a number as Colombian Pesos (COP)
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Generate a unique order number: LC-YYYYMMDD-XXX
 */
export function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  const rand = randomBytes(3).toString("hex").toUpperCase()
  return `LC-${dateStr}-${rand}`
}

/**
 * Create a URL-friendly slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

/**
 * Build a WhatsApp link with a pre-filled message
 */
export function buildWhatsAppLink(message?: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573000000000"
  const text = encodeURIComponent(
    message || "¡Hola! Me interesa comprar en LilCake 🎂"
  )
  return `https://wa.me/${phone}?text=${text}`
}

/**
 * Truncate a string to a max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + "..."
}

/**
 * clsx-like utility for conditional class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}
