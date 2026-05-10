"use client"

import Link from "next/link"
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/components/CartProvider"
import { Button } from "@/components/ui/Button"
import { formatCOP } from "@/lib/utils"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center sm:py-32">
        <div className="rounded-lg border border-lc-border bg-lc-card p-8 sm:p-12">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-lc-border text-lc-white">
            <ShoppingBag size={22} />
          </div>
          <h1 className="mb-4 text-3xl font-heading font-bold text-lc-white">
            Tu carrito esta vacio
          </h1>
          <p className="mx-auto mb-8 max-w-md text-lc-gray-light">
            Explora el catalogo y guarda las piezas que quieres comprar.
          </p>
          <Link href="/productos" className="btn-primary inline-flex items-center gap-2">
            Ver catalogo
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8 border-b border-lc-border pb-6">
        <p className="mb-3 text-sm font-semibold text-lc-purple-light">
          Compra en curso
        </p>
        <h1 className="text-3xl font-heading font-bold text-lc-white sm:text-5xl">
          Carrito
        </h1>
        <p className="mt-3 text-sm text-lc-gray-light">
          {itemCount} {itemCount === 1 ? "producto" : "productos"} listos para revisar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="col-span-1 space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 rounded-lg border border-lc-border bg-lc-card p-4 sm:gap-6 sm:p-5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="h-28 w-24 shrink-0 rounded-md bg-lc-black object-cover sm:h-40 sm:w-32"
              />

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <Link
                    href={`/productos/${item.productSlug}`}
                    className="line-clamp-2 text-base font-bold text-lc-white transition-colors hover:text-lc-gray-light sm:text-lg"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.variantId)}
                    className="rounded-md border border-lc-border bg-lc-darker p-2 text-lc-gray transition-colors hover:text-lc-error"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-4 text-sm text-lc-gray">
                  {[item.size, item.color].filter(Boolean).join(" - ") || "Talla unica"}
                </div>

                <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex w-max items-center rounded-md border border-lc-border bg-lc-darker">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-3 py-2 text-lc-gray transition-colors hover:text-lc-white"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-lc-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
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
          <div className="rounded-lg border border-lc-border bg-lc-card p-5 lg:sticky lg:top-28 lg:p-6">
            <h2 className="mb-6 text-xl font-heading font-bold text-lc-white">
              Resumen del pedido
            </h2>

            <div className="mb-6 space-y-4 border-b border-lc-border pb-6 text-sm">
              <div className="flex justify-between text-lc-gray-light">
                <span>Subtotal</span>
                <span>{formatCOP(total)}</span>
              </div>
              <div className="flex justify-between gap-4 text-lc-gray-light">
                <span>Envio estimado</span>
                <span className="text-right text-lc-success">Calculado en checkout</span>
              </div>
            </div>

            <div className="mb-8 flex items-end justify-between">
              <span className="font-bold text-lc-white">Total</span>
              <span className="text-3xl font-heading font-bold text-lc-white">
                {formatCOP(total)}
              </span>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button className="h-14 w-full rounded-md text-base">
                Continuar al checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
