"use client"

import Link from "next/link"
import { useCart } from "@/components/CartProvider"
import { formatCOP } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Trash2, ArrowRight } from "lucide-react"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center animate-fade-in">
        <div className="bg-lc-darker rounded-3xl border border-lc-border p-12">
          <h1 className="text-3xl font-heading font-bold text-lc-white mb-4">
            Tu carrito está vacío
          </h1>
          <p className="text-lc-gray mb-8">
            Parece que aún no has agregado nada. Descubre las últimas tendencias y eleva tu estilo.
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-heading font-bold text-lc-white mb-8">
        Tu Carrito <span className="text-lc-gray text-xl">({itemCount} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.variantId} className="flex flex-col sm:flex-row gap-6 p-6 bg-lc-dark rounded-2xl border border-lc-border">
              {/* Image */}
              <div className="w-full sm:w-32 h-40 bg-lc-black rounded-xl overflow-hidden shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/productos/${item.productSlug}`} className="text-lg font-bold text-lc-white hover:text-lc-purple transition-colors line-clamp-2">
                    {item.name}
                  </Link>
                  <button 
                    onClick={() => removeFromCart(item.variantId)}
                    className="p-2 text-lc-gray hover:text-lc-error transition-colors bg-lc-darker rounded-lg"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="text-sm text-lc-gray mb-4">
                  {[item.size, item.color].filter(Boolean).join(" - ") || "Talla Única"}
                </div>

                <div className="mt-auto flex justify-between items-center">
                  <div className="flex items-center border border-lc-border rounded-lg bg-lc-darker">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-3 py-2 text-lc-gray hover:text-lc-white transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-lc-white text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-3 py-2 text-lc-gray hover:text-lc-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-lg font-bold text-lc-white">
                    {formatCOP(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="col-span-1">
          <div className="bg-lc-darker border border-lc-border rounded-2xl p-6 sticky top-28">
            <h2 className="text-xl font-heading font-bold text-lc-white mb-6">Resumen del Pedido</h2>
            
            <div className="space-y-4 mb-6 pb-6 border-b border-lc-border text-sm">
              <div className="flex justify-between text-lc-gray-light">
                <span>Subtotal</span>
                <span>{formatCOP(total)}</span>
              </div>
              <div className="flex justify-between text-lc-gray-light">
                <span>Envío estimado</span>
                <span className="text-lc-success">Calculado en checkout</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="text-lc-white font-bold">Total</span>
              <span className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-lc-purple to-lc-pink">
                {formatCOP(total)}
              </span>
            </div>

            <Link href="/checkout" className="w-full">
              <Button className="w-full h-14 text-lg">
                Proceder al Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
