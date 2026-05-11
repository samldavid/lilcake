"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, CreditCard, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart, type CartItem } from "@/components/CartProvider"
import { Button } from "@/components/ui/Button"
import { writeBuyNowCheckout } from "@/lib/buy-now-checkout"

interface AddToCartBtnProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    image: string
  }
  variants: {
    id: string
    size: string | null
    color: string | null
    stock: number
  }[]
}

export function AddToCartBtn({ product, variants }: AddToCartBtnProps) {
  const { addToCart } = useCart()
  const router = useRouter()
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(
    variants.length === 1 ? variants[0].id : ""
  )
  const [quantity, setQuantity] = React.useState(1)
  const [added, setAdded] = React.useState(false)
  const [lastAddedItem, setLastAddedItem] = React.useState<CartItem | null>(null)
  const addedTimerRef = React.useRef<number | null>(null)

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const availableStock = selectedVariant ? selectedVariant.stock : 0

  React.useEffect(() => {
    return () => {
      if (addedTimerRef.current) {
        window.clearTimeout(addedTimerRef.current)
      }
    }
  }, [])
  const requireSelection = variants.length > 1
  const isActionDisabled =
    !selectedVariantId || availableStock === 0 || quantity < 1

  const buildCartItem = (): CartItem | null => {
    if (!selectedVariant) {
      return null
    }

    return {
      variantId: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      size: selectedVariant.size || undefined,
      color: selectedVariant.color || undefined,
    }
  }

  const handleAddToCart = () => {
    const item = buildCartItem()

    if (!item) return

    addToCart(item)

    setAdded(true)
    setLastAddedItem(item)
    if (addedTimerRef.current) {
      window.clearTimeout(addedTimerRef.current)
    }
    addedTimerRef.current = window.setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    const item = buildCartItem()

    if (!item) return

    writeBuyNowCheckout(item)
    router.push("/checkout?directo=1")
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {requireSelection ? (
        <div className="space-y-3">
          <label className="block text-sm font-bold text-lc-white font-heading">
            Talla / Variante
          </label>
          <div className="flex flex-wrap gap-3">
            {variants.map((variant) => {
              const label =
                [variant.size, variant.color].filter(Boolean).join(" - ") || "Unica"
              const isSelected = selectedVariantId === variant.id
              const isOutOfStock = variant.stock <= 0

              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded-md border px-3.5 py-2 text-sm font-medium transition-colors sm:px-4 ${
                    isSelected
                      ? "border-lc-white bg-lc-white text-lc-black"
                      : isOutOfStock
                        ? "cursor-not-allowed border-lc-border bg-lc-darker/50 text-lc-gray opacity-50"
                        : "border-lc-border bg-lc-dark text-lc-gray-light hover:border-lc-gray-light"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {selectedVariantId && availableStock > 0 ? (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center rounded-md border border-lc-border bg-lc-dark">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-3 text-lc-gray transition-colors hover:text-lc-white"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-lc-white">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
              className="px-4 py-3 text-lc-gray transition-colors hover:text-lc-white"
            >
              +
            </button>
          </div>
          <span className="text-sm text-lc-gray">{availableStock} disponibles</span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="h-12 w-full rounded-md text-base font-bold sm:h-14 sm:text-lg"
          disabled={isActionDisabled}
          onClick={handleBuyNow}
        >
          <CreditCard size={20} className="mr-2" />
          {selectedVariantId && availableStock === 0 ? "Agotado" : "Comprar ahora"}
        </Button>
        <Button
          variant="secondary"
          className="h-12 w-full rounded-md text-base font-bold sm:h-14 sm:text-lg"
          disabled={isActionDisabled}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={20} className="mr-2" />
          {added ? "Agregado" : "Agregar al carrito"}
        </Button>
      </div>

      {lastAddedItem ? (
        <div
          className="rounded-lg border border-lc-success/25 bg-lc-success/10 p-4"
          aria-live="polite"
        >
          <div className="flex gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-lc-border bg-lc-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lastAddedItem.image}
                alt={lastAddedItem.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-bold text-lc-success">
                <CheckCircle2 size={17} />
                Producto agregado
              </div>
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-lc-white">
                {lastAddedItem.name}
              </p>
              <p className="mt-1 text-xs text-lc-gray-light">
                Cantidad {lastAddedItem.quantity}
                {lastAddedItem.size ? ` - Talla ${lastAddedItem.size}` : ""}
                {lastAddedItem.color ? ` - ${lastAddedItem.color}` : ""}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              href="/carrito"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-lc-white px-4 text-sm font-bold text-lc-black transition-colors hover:bg-lc-purple hover:text-white"
            >
              Ver carrito <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={() => setLastAddedItem(null)}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-lc-border px-4 text-sm font-bold text-lc-white transition-colors hover:border-lc-gray-light hover:bg-lc-dark"
            >
              Seguir comprando
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
