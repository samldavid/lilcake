"use client"

import * as React from "react"
import { useCart } from "@/components/CartProvider"
import { Button } from "@/components/ui/Button"
import { ShoppingCart } from "lucide-react"

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
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(
    variants.length === 1 ? variants[0].id : ""
  )
  const [quantity, setQuantity] = React.useState(1)
  const [added, setAdded] = React.useState(false)

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const availableStock = selectedVariant ? selectedVariant.stock : 0

  const handleAddToCart = () => {
    if (!selectedVariant) return

    addToCart({
      variantId: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      price: product.price, // In real app, consider variant.priceOverride
      quantity,
      image: product.image,
      size: selectedVariant.size || undefined,
      color: selectedVariant.color || undefined,
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Group variants manually for UI if needed (simplified for MVP: just show a generic selector if multiple)
  const requireSelection = variants.length > 1

  return (
    <div className="space-y-6">
      {requireSelection && (
        <div className="space-y-3">
          <label className="block text-sm font-bold text-lc-white font-heading">
            Talla / Variante
          </label>
          <div className="flex flex-wrap gap-3">
            {variants.map((v) => {
              const label = [v.size, v.color].filter(Boolean).join(" - ") || "Única"
              const isSelected = selectedVariantId === v.id
              const isOutOfStock = v.stock <= 0

              return (
                <button
                  key={v.id}
                  disabled={isOutOfStock}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    isSelected
                      ? "border-lc-purple bg-lc-purple/10 text-lc-white"
                      : isOutOfStock
                      ? "border-lc-border bg-lc-darker/50 text-lc-gray cursor-not-allowed opacity-50"
                      : "border-lc-border bg-lc-dark hover:border-lc-gray text-lc-gray-light"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selectedVariantId && availableStock > 0 && (
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-lc-border rounded-xl bg-lc-dark">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-3 text-lc-gray hover:text-lc-white transition-colors"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-lc-white">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
              className="px-4 py-3 text-lc-gray hover:text-lc-white transition-colors"
            >
              +
            </button>
          </div>
          <span className="text-sm text-lc-gray">
            {availableStock} disponibles
          </span>
        </div>
      )}

      <Button
        className="w-full h-14 text-lg font-bold shadow-[0_0_20px_rgba(108,60,225,0.2)]"
        disabled={!selectedVariantId || availableStock === 0 || quantity < 1}
        onClick={handleAddToCart}
      >
        <ShoppingCart size={20} className="mr-2" />
        {added ? "¡Agregado!" : availableStock === 0 ? "Agotado" : "Agregar al Carrito"}
      </Button>
    </div>
  )
}
