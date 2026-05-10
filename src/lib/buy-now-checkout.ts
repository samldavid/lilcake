import type { CartItem } from "@/components/CartProvider"

const BUY_NOW_MAX_AGE_MS = 24 * 60 * 60 * 1000

export const BUY_NOW_CHECKOUT_STORAGE_KEY = "lilcake-buy-now-checkout"

export type BuyNowCheckout = {
  item: CartItem
  createdAt: number
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false
  }

  const item = value as Partial<CartItem>

  return (
    typeof item.variantId === "string" &&
    typeof item.productId === "string" &&
    typeof item.productSlug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    typeof item.image === "string"
  )
}

export function writeBuyNowCheckout(item: CartItem) {
  if (typeof window === "undefined") {
    return
  }

  const payload: BuyNowCheckout = {
    item,
    createdAt: Date.now(),
  }

  window.sessionStorage.setItem(
    BUY_NOW_CHECKOUT_STORAGE_KEY,
    JSON.stringify(payload)
  )
}

export function readBuyNowCheckout(): BuyNowCheckout | null {
  if (typeof window === "undefined") {
    return null
  }

  const rawValue = window.sessionStorage.getItem(BUY_NOW_CHECKOUT_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<BuyNowCheckout>
    const createdAt =
      typeof parsed.createdAt === "number" ? parsed.createdAt : 0
    const isExpired = Date.now() - createdAt > BUY_NOW_MAX_AGE_MS

    if (!isCartItem(parsed.item) || isExpired) {
      clearBuyNowCheckout()
      return null
    }

    return {
      item: parsed.item,
      createdAt,
    }
  } catch {
    clearBuyNowCheckout()
    return null
  }
}

export function clearBuyNowCheckout() {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(BUY_NOW_CHECKOUT_STORAGE_KEY)
}
