"use client"

import Link from "next/link"
import { ArrowRight, Trash2 } from "lucide-react"
import { useCart } from "@/components/CartProvider"
import { Button } from "@/components/ui/Button"
import { formatCOP } from "@/lib/utils"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-32 text-center animate-fade-in">
        <div className="rounded-3xl border border-lc-border bg-lc-darker p-12">
          <h1 className="mb-4 text-3xl font-heading font-bold text-lc-white">
            Tu carrito está vacío
          </h1>
          <p className="mb-8 text-lc-gray">
            Parece que aún no has agregado nada. Descubre las últimas tendencias
            y eleva tu estilo.
          </p>
          <Link href="/productos" className="btn-primary inline-flex items-center gap-2">
            Ver Colección
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 animate-fade-in">
      <h1 className="mb-6 text-2xl font-heading font-bold text-lc-white sm:mb-8 sm:text-3xl">
        Tu Carrito <span className="text-lg text-lc-gray sm:text-xl">({itemCount} items)</span>
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="col-span-1 space-y-4 sm:space-y-6 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 rounded-2xl border border-lc-border bg-lc-dark p-4 sm:gap-6 sm:p-6"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="h-28 w-24 shrink-0 rounded-xl bg-lc-black object-cover sm:h-40 sm:w-32"
              />

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <Link
                    href={`/productos/${item.productSlug}`}
                    className="line-clamp-2 text-base font-bold text-lc-white transition-colors hover:text-lc-purple sm:text-lg"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="rounded-lg bg-lc-darker p-2 text-lc-gray transition-colors hover:text-lc-error"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-4 text-sm text-lc-gray">
                  {[item.size, item.color].filter(Boolean).join(" - ") || "Talla única"}
                </div>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center rounded-lg border border-lc-border bg-lc-darker">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-3 py-2 text-lc-gray transition-colors hover:text-lc-white"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-lc-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-3 py-2 text-lc-gray transition-colors hover:text-lc-white"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-lg font-bold text-lc-white sm:text-right">
                    {formatCOP(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-1">
          <div className="rounded-2xl border border-lc-border bg-lc-darker p-5 lg:sticky lg:top-28 lg:p-6">
            <h2 className="mb-6 text-xl font-heading font-bold text-lc-white">
              Resumen del Pedido
            </h2>

            <div className="mb-6 space-y-4 border-b border-lc-border pb-6 text-sm">
              <div className="flex justify-between text-lc-gray-light">
                <span>Subtotal</span>
                <span>{formatCOP(total)}</span>
              </div>
              <div className="flex justify-between text-lc-gray-light">
                <span>Envío estimado</span>
                <span className="text-lc-success">Calculado en checkout</span>
              </div>
            </div>

            <div className="mb-8 flex items-end justify-between">
              <span className="font-bold text-lc-white">Total</span>
              <span className="bg-gradient-to-r from-lc-purple to-lc-pink bg-clip-text text-3xl font-heading font-bold text-transparent">
                {formatCOP(total)}
              </span>
            </div>

            <Link href="/checkout" className="w-full">
              <Button className="h-14 w-full text-lg">Proceder al Checkout</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
