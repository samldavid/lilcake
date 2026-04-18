"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/components/CartProvider"
import { formatCOP } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

const stripeEnabled = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true"

function CheckoutPageContent() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [isFinalizing, setIsFinalizing] = React.useState(false)
  const [error, setError] = React.useState("")
  const [orderNumber, setOrderNumber] = React.useState("")
  const [formData, setFormData] = React.useState({
    shippingName: "",
    email: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPhone: "",
    paymentMethod: stripeEnabled ? "STRIPE" : "WHATSAPP",
  })

  const successParam = searchParams.get("success") === "true"
  const canceledParam = searchParams.get("canceled") === "true"
  const sessionId = searchParams.get("session_id")

  React.useEffect(() => {
    if (session?.user?.email && !formData.email) {
      setFormData((current) => ({ ...current, email: session.user.email }))
    }
  }, [formData.email, session?.user?.email])

  React.useEffect(() => {
    if (status === "loading" || !successParam || !sessionId || success) {
      return
    }

    let isActive = true

    const finalizeCheckout = async () => {
      try {
        setIsFinalizing(true)
        setError("")

        const response = await fetch(
          `/api/checkout/stripe?session_id=${encodeURIComponent(sessionId)}`
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "No pudimos confirmar el pago.")
        }

        if (data.status !== "paid") {
          throw new Error("El pago aun no aparece como aprobado.")
        }

        if (!isActive) {
          return
        }

        clearCart()
        setOrderNumber(data.orderNumber || "")
        setSuccess(true)
      } catch (checkoutError) {
        if (!isActive) {
          return
        }

        setError(
          checkoutError instanceof Error
            ? checkoutError.message
            : "No pudimos confirmar el estado del pago."
        )
      } finally {
        if (isActive) {
          setIsFinalizing(false)
        }
      }
    }

    void finalizeCheckout()

    return () => {
      isActive = false
    }
  }, [clearCart, sessionId, status, success, successParam])

  React.useEffect(() => {
    if (
      status !== "loading" &&
      items.length === 0 &&
      !success &&
      !isFinalizing &&
      !successParam
    ) {
      router.push("/carrito")
    }
  }, [isFinalizing, items.length, router, status, success, successParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`)
      return
    }

    try {
      setLoading(true)
      setError("")

      const payload = {
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        customerEmail: formData.email,
        shippingName: formData.shippingName,
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingPhone: formData.shippingPhone,
        paymentMethod: formData.paymentMethod,
      }

      const endpoint =
        formData.paymentMethod === "STRIPE"
          ? "/api/checkout/stripe"
          : "/api/checkout/whatsapp"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No pudimos procesar tu pedido.")
      }

      if (!data.url) {
        throw new Error("No recibimos la URL de redireccion.")
      }

      if (formData.paymentMethod === "WHATSAPP") {
        clearCart()
        setOrderNumber(data.orderNumber || "")
      }

      window.location.assign(data.url)
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "No pudimos procesar tu pedido."
      )
      setLoading(false)
    }
  }

  if (isFinalizing) {
    return (
      <div className="max-w-2xl mx-auto py-32 px-4 text-center animate-fade-in">
        <h1 className="text-3xl font-heading font-bold text-lc-white mb-4">
          Confirmando tu pago
        </h1>
        <p className="text-lc-gray text-lg">
          Estamos validando la sesion de Stripe para registrar tu pedido.
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-32 px-4 text-center animate-scale-in">
        <div className="w-24 h-24 bg-lc-success/20 text-lc-success rounded-full flex items-center justify-center mx-auto mb-8 border border-lc-success/30 glow">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-heading font-bold text-lc-white mb-4">
          Pedido confirmado
        </h1>
        <p className="text-lc-gray text-lg mb-8">
          Tu pedido ya quedo registrado correctamente y nuestro equipo ya puede darle seguimiento.
        </p>
        {orderNumber && (
          <p className="text-sm font-semibold text-lc-purple mb-8">
            Numero de pedido: {orderNumber}
          </p>
        )}
        <Button onClick={() => router.push("/")} size="lg">
          Volver a la Tienda
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <h1 className="text-3xl font-heading font-bold text-lc-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {canceledParam && (
              <div className="rounded-2xl border border-lc-warning/30 bg-lc-warning/10 p-4 text-sm text-lc-warning">
                Cancelaste la sesion de pago. Puedes revisar tus datos e intentarlo de nuevo.
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-lc-error/30 bg-lc-error/10 p-4 text-sm text-lc-error">
                {error}
              </div>
            )}

            {!session?.user?.id && status !== "loading" && (
              <div className="rounded-2xl border border-lc-purple/30 bg-lc-purple/10 p-4 text-sm text-lc-gray-light">
                Necesitas iniciar sesion para crear la orden y continuar con el pago.
              </div>
            )}

            <div className="bg-lc-dark rounded-2xl p-6 sm:p-8 border border-lc-border">
              <h2 className="text-xl font-heading font-bold text-lc-white mb-6">
                1. Datos de envio
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Nombre Completo"
                  required
                  value={formData.shippingName}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingName: e.target.value })
                  }
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Direccion"
                    required
                    placeholder="Calle, numero, apartamento..."
                    value={formData.shippingAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingAddress: e.target.value })
                    }
                  />
                </div>
                <Input
                  label="Ciudad"
                  required
                  value={formData.shippingCity}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingCity: e.target.value })
                  }
                />
                <Input
                  label="Telefono"
                  type="tel"
                  required
                  value={formData.shippingPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingPhone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="bg-lc-dark rounded-2xl p-6 sm:p-8 border border-lc-border">
              <h2 className="text-xl font-heading font-bold text-lc-white mb-6">
                2. Metodo de Pago
              </h2>
              <div className="space-y-4">
                {stripeEnabled && (
                  <label
                    className={`block p-4 border rounded-xl cursor-pointer transition-colors ${formData.paymentMethod === "STRIPE" ? "border-lc-purple bg-lc-purple/10" : "border-lc-border bg-lc-darker hover:border-lc-gray"}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="STRIPE"
                        checked={formData.paymentMethod === "STRIPE"}
                        onChange={() =>
                          setFormData({ ...formData, paymentMethod: "STRIPE" })
                        }
                        className="w-5 h-5 text-lc-purple bg-lc-black border-lc-gray focus:ring-lc-purple focus:ring-offset-lc-black"
                      />
                      <span className="ml-4 font-bold text-lc-white">
                        Tarjeta de Credito / Debito (Stripe)
                      </span>
                    </div>
                    <p className="ml-9 mt-1 text-sm text-lc-gray">
                      Pago seguro e inmediato.
                    </p>
                  </label>
                )}

                <label
                  className={`block p-4 border rounded-xl cursor-pointer transition-colors ${formData.paymentMethod === "WHATSAPP" ? "border-lc-success bg-lc-success/10" : "border-lc-border bg-lc-darker hover:border-lc-gray"}`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="WHATSAPP"
                      checked={formData.paymentMethod === "WHATSAPP"}
                      onChange={() =>
                        setFormData({ ...formData, paymentMethod: "WHATSAPP" })
                      }
                      className="w-5 h-5 text-lc-success bg-lc-black border-lc-gray focus:ring-lc-success focus:ring-offset-lc-black"
                    />
                    <span className="ml-4 font-bold text-lc-white">
                      WhatsApp / Transferencia Bancaria
                    </span>
                  </div>
                  <p className="ml-9 mt-1 text-sm text-lc-gray">
                    Registramos la orden y te llevamos al chat para coordinar el pago.
                  </p>
                </label>
                {!stripeEnabled && (
                  <div className="rounded-xl border border-lc-border border-dashed bg-lc-darker/60 p-4 text-sm text-lc-gray">
                    Los pagos con Stripe estan desactivados por ahora en este entorno.
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-lc-darker border border-lc-border rounded-2xl p-6 sticky top-28">
            <h2 className="text-xl font-heading font-bold text-lc-white mb-6">Tu Pedido</h2>

            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  <div className="w-16 h-16 bg-lc-black border border-lc-border rounded-lg overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-bold text-lc-white line-clamp-2 leading-tight">{item.name}</p>
                    <p className="text-lc-gray mt-1">Cant: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-lc-white shrink-0">
                    {formatCOP(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-lc-border mb-6 text-sm">
              <div className="flex justify-between text-lc-gray-light">
                <span>Subtotal</span>
                <span>{formatCOP(total)}</span>
              </div>
              <div className="flex justify-between text-lc-gray-light">
                <span>Envio</span>
                <span className="text-lc-success">Gratis</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8 pt-6 border-t border-lc-border">
              <span className="text-lc-white font-bold text-lg">Total</span>
              <span className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-lc-purple to-lc-pink">
                {formatCOP(total)}
              </span>
            </div>

            <Button
              type="submit"
              form="checkout-form"
              className="w-full h-14 text-lg"
              disabled={loading || isFinalizing || status === "loading"}
            >
              {loading
                ? "Procesando..."
                : !session?.user?.id
                  ? "Inicia sesion para continuar"
                  : formData.paymentMethod === "STRIPE"
                    ? "Pagar con Stripe"
                    : "Confirmar via WhatsApp"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-32 px-4 text-center animate-fade-in">
          <h1 className="text-3xl font-heading font-bold text-lc-white mb-4">
            Cargando checkout
          </h1>
          <p className="text-lc-gray text-lg">
            Estamos preparando los datos de tu pedido.
          </p>
        </div>
      }
    >
      <CheckoutPageContent />
    </React.Suspense>
  )
}
