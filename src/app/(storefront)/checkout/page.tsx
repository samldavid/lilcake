"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/components/CartProvider"
import { formatCOP } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

const stripeEnabled = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true"
const CHECKOUT_DETAILS_STORAGE_KEY = "lilcake-checkout-details"

type AppliedCoupon = {
  code: string
  type: "PERCENTAGE" | "FIXED"
  value: number
  subtotal: number
  discount: number
  total: number
  minPurchase: number | null
  expiresAt: string | null
}

type SavedCheckoutDetails = {
  shippingName: string
  email: string
  shippingAddress: string
  shippingCity: string
  shippingPhone: string
}

function parseSavedCheckoutDetails(rawValue: string | null): SavedCheckoutDetails | null {
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue)

    if (!parsed || typeof parsed !== "object") {
      return null
    }

    return {
      shippingName:
        typeof parsed.shippingName === "string" ? parsed.shippingName : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      shippingAddress:
        typeof parsed.shippingAddress === "string" ? parsed.shippingAddress : "",
      shippingCity:
        typeof parsed.shippingCity === "string" ? parsed.shippingCity : "",
      shippingPhone:
        typeof parsed.shippingPhone === "string" ? parsed.shippingPhone : "",
    }
  } catch {
    return null
  }
}

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
  const [couponCode, setCouponCode] = React.useState("")
  const [appliedCoupon, setAppliedCoupon] = React.useState<AppliedCoupon | null>(null)
  const [couponFeedback, setCouponFeedback] = React.useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false)
  const [rememberDetails, setRememberDetails] = React.useState(true)
  const [detailsLoaded, setDetailsLoaded] = React.useState(false)
  const [acceptedTerms, setAcceptedTerms] = React.useState(false)
  const [formData, setFormData] = React.useState({
    shippingName: "",
    email: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPhone: "",
    paymentMethod: stripeEnabled ? "STRIPE" : "WHATSAPP",
  })

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const savedDetails = parseSavedCheckoutDetails(
      window.localStorage.getItem(CHECKOUT_DETAILS_STORAGE_KEY)
    )

    if (savedDetails) {
      setFormData((current) => ({
        ...current,
        ...savedDetails,
      }))
      setRememberDetails(true)
    }

    setDetailsLoaded(true)
  }, [])

  const successParam = searchParams.get("success") === "true"
  const canceledParam = searchParams.get("canceled") === "true"
  const sessionId = searchParams.get("session_id")

  React.useEffect(() => {
    if (!detailsLoaded) {
      return
    }

    const sessionName = session?.user?.name || ""
    const sessionEmail = session?.user?.email || ""
    const shouldHydrateName = !formData.shippingName && Boolean(sessionName)
    const shouldHydrateEmail = !formData.email && Boolean(sessionEmail)

    if (!shouldHydrateName && !shouldHydrateEmail) {
      return
    }

    setFormData((current) => ({
      ...current,
      shippingName: shouldHydrateName ? sessionName : current.shippingName,
      email: shouldHydrateEmail ? sessionEmail : current.email,
    }))
  }, [detailsLoaded, formData.email, formData.shippingName, session?.user?.email, session?.user?.name])

  React.useEffect(() => {
    if (!detailsLoaded || typeof window === "undefined") {
      return
    }

    if (!rememberDetails) {
      window.localStorage.removeItem(CHECKOUT_DETAILS_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(
      CHECKOUT_DETAILS_STORAGE_KEY,
      JSON.stringify({
        shippingName: formData.shippingName,
        email: formData.email,
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingPhone: formData.shippingPhone,
      } satisfies SavedCheckoutDetails)
    )
  }, [detailsLoaded, formData, rememberDetails])

  React.useEffect(() => {
    if (status === "loading" || !successParam || !sessionId || success) {
      return
    }

    let isActive = true
    const wait = (ms: number) =>
      new Promise((resolve) => {
        window.setTimeout(resolve, ms)
      })

    const finalizeCheckout = async () => {
      try {
        setIsFinalizing(true)
        setError("")

        for (let attempt = 0; attempt < 10; attempt += 1) {
          const response = await fetch(
            `/api/checkout/stripe?session_id=${encodeURIComponent(sessionId)}`,
            {
              cache: "no-store",
            }
          )
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "No pudimos confirmar el pago.")
          }

          if (data.status === "paid") {
            if (!isActive) {
              return
            }

            clearCart()
            setOrderNumber(data.orderNumber || "")
            setSuccess(true)
            return
          }

          if (data.status === "failed") {
            throw new Error("El pago no pudo confirmarse para este pedido.")
          }

          if (attempt < 9) {
            await wait(1500)
          }
        }

        throw new Error(
          "Stripe ya recibio el pago, pero aun estamos terminando de confirmarlo. Recarga esta pagina en unos segundos."
        )
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

  const validateCoupon = React.useCallback(
    async (codeOverride?: string) => {
      const rawCode = codeOverride ?? couponCode
      const nextCode = rawCode.trim().toUpperCase()

      if (!nextCode) {
        setAppliedCoupon(null)
        setCouponFeedback(null)
        return true
      }

      if (!session?.user?.id) {
        router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`)
        return false
      }

      try {
        setIsValidatingCoupon(true)
        setCouponFeedback(null)

        const response = await fetch("/api/checkout/coupon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            couponCode: nextCode,
            items: items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          }),
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "No pudimos validar el cupon.")
        }

        setCouponCode(data.code)
        setAppliedCoupon(data)
        setCouponFeedback({
          type: "success",
          message: `Se aplico el cupon ${data.code}.`,
        })

        return true
      } catch (couponError) {
        setAppliedCoupon(null)
        setCouponFeedback({
          type: "error",
          message:
            couponError instanceof Error
              ? couponError.message
              : "No pudimos validar el cupon.",
        })
        return false
      } finally {
        setIsValidatingCoupon(false)
      }
    },
    [couponCode, items, router, session?.user?.id]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`)
      return
    }

    try {
      setLoading(true)
      setError("")

      const normalizedCouponCode = couponCode.trim().toUpperCase()

      if (
        normalizedCouponCode &&
        (!appliedCoupon || appliedCoupon.code !== normalizedCouponCode)
      ) {
        const couponIsValid = await validateCoupon(normalizedCouponCode)

        if (!couponIsValid) {
          setLoading(false)
          return
        }
      }

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
        couponCode: normalizedCouponCode || undefined,
        acceptedTerms,
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

  const normalizedCouponCode = couponCode.trim().toUpperCase()
  const activeAppliedCoupon =
    appliedCoupon && appliedCoupon.code === normalizedCouponCode
      ? appliedCoupon
      : null
  const displayDiscount = activeAppliedCoupon?.discount ?? 0
  const displayTotal = activeAppliedCoupon?.total ?? total

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 animate-fade-in">
      <h1 className="mb-6 text-2xl font-heading font-bold text-lc-white sm:mb-8 sm:text-3xl">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="order-2 space-y-8 lg:order-1 lg:col-span-7">
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

            <div className="rounded-2xl border border-lc-border bg-lc-dark p-5 sm:p-8">
              <h2 className="text-xl font-heading font-bold text-lc-white mb-6">
                1. Datos de envio
              </h2>
              <div className="mb-6 rounded-2xl border border-lc-border bg-lc-darker/60 p-4">
                <label className="flex items-start gap-3 text-sm text-lc-gray-light">
                  <input
                    type="checkbox"
                    checked={rememberDetails}
                    onChange={(event) => setRememberDetails(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-lc-border bg-lc-black text-lc-purple focus:ring-lc-purple"
                  />
                  <span>
                    Guardar estos datos en este navegador para autocompletar futuras compras.
                  </span>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  name="shippingName"
                  autoComplete="shipping name"
                  label="Nombre Completo"
                  required
                  value={formData.shippingName}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingName: e.target.value })
                  }
                />
                <Input
                  name="customerEmail"
                  autoComplete="email"
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
                    name="shippingAddress"
                    autoComplete="shipping street-address"
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
                  name="shippingCity"
                  autoComplete="shipping address-level2"
                  label="Ciudad"
                  required
                  value={formData.shippingCity}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingCity: e.target.value })
                  }
                />
                <Input
                  name="shippingPhone"
                  autoComplete="tel"
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

            <div className="rounded-2xl border border-lc-border bg-lc-dark p-5 sm:p-8">
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

            <div className="rounded-2xl border border-lc-border bg-lc-dark p-5 sm:p-8">
              <h2 className="text-xl font-heading font-bold text-lc-white mb-4">
                3. Confirmacion legal
              </h2>
              <label className="flex items-start gap-3 rounded-2xl border border-lc-border bg-lc-darker/60 p-4 text-sm text-lc-gray-light">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-lc-border bg-lc-black text-lc-purple focus:ring-lc-purple"
                />
                <span className="leading-6">
                  He leido y acepto los{" "}
                  <Link
                    href="/terminos"
                    target="_blank"
                    className="font-semibold text-lc-cyan transition-colors hover:text-white"
                  >
                    terminos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link
                    href="/privacidad"
                    target="_blank"
                    className="font-semibold text-lc-cyan transition-colors hover:text-white"
                  >
                    politica de privacidad
                  </Link>{" "}
                  antes de confirmar esta compra.
                </span>
              </label>
            </div>
          </form>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-5">
          <div className="rounded-2xl border border-lc-border bg-lc-darker p-5 lg:sticky lg:top-28 lg:p-6">
            <h2 className="text-xl font-heading font-bold text-lc-white mb-6">Tu Pedido</h2>

            <div className="mb-6 max-h-[240px] space-y-4 overflow-y-auto pr-2 custom-scrollbar sm:max-h-[300px]">
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
              <div className="rounded-2xl border border-lc-border bg-lc-dark/70 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-lc-white">
                      Codigo de descuento
                    </p>
                    <p className="text-xs text-lc-gray mt-1">
                      Aplicalo antes de pagar para recalcular el total.
                    </p>
                  </div>
                  {activeAppliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCouponCode("")
                        setAppliedCoupon(null)
                        setCouponFeedback(null)
                      }}
                      className="text-xs font-semibold text-lc-gray hover:text-lc-white transition-colors"
                    >
                      Quitar
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                    placeholder="Ej: BIENVENIDA10"
                    autoComplete="off"
                    spellCheck={false}
                    className="input-field h-12 flex-1"
                  />
                  <Button
                    type="button"
                    className="sm:min-w-[132px]"
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    onClick={() => void validateCoupon()}
                  >
                    {isValidatingCoupon ? "Validando..." : "Aplicar"}
                  </Button>
                </div>

                {couponFeedback ? (
                  <div
                    className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
                      couponFeedback.type === "success"
                        ? "border-lc-success/30 bg-lc-success/10 text-lc-success"
                        : "border-lc-error/30 bg-lc-error/10 text-lc-error"
                    }`}
                  >
                    {couponFeedback.message}
                  </div>
                ) : null}
              </div>

              <div className="flex justify-between text-lc-gray-light">
                <span>Subtotal</span>
                <span>{formatCOP(total)}</span>
              </div>
              {displayDiscount > 0 ? (
                <div className="flex justify-between text-lc-success">
                  <span>Descuento</span>
                  <span>- {formatCOP(displayDiscount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-lc-gray-light">
                <span>Envio</span>
                <span className="text-lc-success">Gratis</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8 pt-6 border-t border-lc-border">
              <span className="text-lc-white font-bold text-lg">Total</span>
              <span className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-lc-purple to-lc-pink">
                {formatCOP(displayTotal)}
              </span>
            </div>

            <Button
              type="submit"
              form="checkout-form"
              className="w-full h-14 text-lg"
              disabled={
                loading ||
                isFinalizing ||
                status === "loading" ||
                isValidatingCoupon ||
                !acceptedTerms
              }
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
