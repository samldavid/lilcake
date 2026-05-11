"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart, type CartItem } from "@/components/CartProvider"
import { formatCOP } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  clearBuyNowCheckout,
  readBuyNowCheckout,
} from "@/lib/buy-now-checkout"

const stripeEnabled = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true"
const wompiEnabled = process.env.NEXT_PUBLIC_WOMPI_ENABLED === "true"
const CHECKOUT_DETAILS_STORAGE_KEY = "lilcake-checkout-details"
const CHECKOUT_RETURN_STORAGE_PREFIX = "lilcake-checkout-return"
const paymentLogoPaths = {
  addi: "/images/payments/addi.svg",
  amex: "/images/payments/amex.svg",
  bancolombia: "/images/payments/bancolombia.png",
  davivienda: "/images/payments/davivienda.svg",
  mastercard: "/images/payments/mastercard.svg",
  nequi: "/images/payments/nequi.svg",
  pse: "/images/payments/pse.png",
  stripe: "/images/payments/stripe.svg",
  visa: "/images/payments/visa.svg",
  whatsapp: "/images/payments/whatsapp.svg",
  wompi: "/images/payments/wompi.svg",
} as const

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

function PaymentLogoBadge({
  label,
  src,
  size = "compact",
  imageClassName = "",
}: {
  label: string
  src: string
  size?: "compact" | "wide" | "square"
  imageClassName?: string
}) {
  const width = size === "wide" ? 112 : size === "square" ? 30 : 76

  return (
    <span
      title={label}
      className={`inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-white/80 bg-white px-3 py-2 shadow-sm ring-1 ring-black/5 ${
        size === "wide"
          ? "min-w-[122px]"
          : size === "square"
            ? "w-11 px-2"
            : "min-w-[84px]"
      }`}
    >
      <Image
        src={src}
        alt={label}
        width={width}
        height={28}
        className={`max-h-6 w-auto max-w-full object-contain ${imageClassName}`}
        unoptimized
      />
    </span>
  )
}

function PaymentTextBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-lc-border bg-lc-black/55 px-3 text-[11px] font-black uppercase tracking-wide text-lc-white">
      {label}
    </span>
  )
}

function getProcessedReturnKey(returnKey: string) {
  return `${CHECKOUT_RETURN_STORAGE_PREFIX}:${returnKey}`
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
  const { items: cartItems, clearCart } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const completedDirectCheckoutRef = React.useRef(false)

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
  const [buyNowLoaded, setBuyNowLoaded] = React.useState(false)
  const [buyNowItem, setBuyNowItem] = React.useState<CartItem | null>(null)
  const [acceptedTerms, setAcceptedTerms] = React.useState(false)
  const [formData, setFormData] = React.useState({
    shippingName: "",
    email: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPhone: "",
    paymentMethod: wompiEnabled ? "WOMPI" : stripeEnabled ? "STRIPE" : "WHATSAPP",
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
  const directCheckoutParam =
    searchParams.get("directo") === "1" || searchParams.get("buyNow") === "1"
  const sessionId = searchParams.get("session_id")
  const providerParam = searchParams.get("provider")
  const wompiTransactionId =
    providerParam === "wompi"
      ? searchParams.get("id") || searchParams.get("transaction_id")
      : null
  const paymentReturnKey = wompiTransactionId
    ? `wompi:${wompiTransactionId}`
    : sessionId
      ? `stripe:${sessionId}`
      : null
  const shouldUseBuyNow = Boolean(
    buyNowItem &&
      (directCheckoutParam || canceledParam || successParam || wompiTransactionId)
  )
  const checkoutItems = React.useMemo(
    () => (shouldUseBuyNow && buyNowItem ? [buyNowItem] : cartItems),
    [buyNowItem, cartItems, shouldUseBuyNow]
  )
  const checkoutTotal = React.useMemo(
    () =>
      checkoutItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      ),
    [checkoutItems]
  )

  React.useEffect(() => {
    const savedBuyNowCheckout = readBuyNowCheckout()

    setBuyNowItem(savedBuyNowCheckout?.item ?? null)
    setBuyNowLoaded(true)
  }, [])

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
    if (!buyNowLoaded) {
      return
    }

    const isStripeReturn = successParam && Boolean(sessionId)
    const isWompiReturn = Boolean(wompiTransactionId)

    if (status === "loading" || (!isStripeReturn && !isWompiReturn) || success) {
      return
    }

    if (
      paymentReturnKey &&
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(getProcessedReturnKey(paymentReturnKey))
    ) {
      router.replace("/checkout", { scroll: false })
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
          const statusUrl = isWompiReturn
            ? `/api/checkout/wompi?id=${encodeURIComponent(wompiTransactionId || "")}`
            : `/api/checkout/stripe?session_id=${encodeURIComponent(sessionId || "")}`
          const response = await fetch(statusUrl, {
            cache: "no-store",
          })
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || "No pudimos confirmar el pago.")
          }

          if (data.status === "paid") {
            if (!isActive) {
              return
            }

            if (shouldUseBuyNow) {
              completedDirectCheckoutRef.current = true
              clearBuyNowCheckout()
              setBuyNowItem(null)
            } else {
              clearCart()
            }
            if (paymentReturnKey && typeof window !== "undefined") {
              window.sessionStorage.setItem(
                getProcessedReturnKey(paymentReturnKey),
                "completed"
              )
            }
            setOrderNumber(data.orderNumber || "")
            setSuccess(true)
            router.replace("/checkout", { scroll: false })
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
          isWompiReturn
            ? "Wompi recibió la transacción, pero aún estamos terminando de confirmarla. Recarga esta página en unos segundos."
            : "Stripe ya recibió el pago, pero aún estamos terminando de confirmarlo. Recarga esta página en unos segundos."
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
  }, [
    buyNowLoaded,
    clearCart,
    paymentReturnKey,
    router,
    sessionId,
    shouldUseBuyNow,
    status,
    success,
    successParam,
    wompiTransactionId,
  ])

  React.useEffect(() => {
    if (
      !success ||
      paymentReturnKey ||
      completedDirectCheckoutRef.current ||
      checkoutItems.length === 0
    ) {
      return
    }

    setSuccess(false)
    setOrderNumber("")
    setError("")
    setLoading(false)
  }, [checkoutItems.length, paymentReturnKey, success])

  React.useEffect(() => {
    if (
      buyNowLoaded &&
      status !== "loading" &&
      checkoutItems.length === 0 &&
      !success &&
      !isFinalizing &&
      !successParam &&
      !wompiTransactionId
    ) {
      router.push("/carrito")
    }
  }, [
    buyNowLoaded,
    checkoutItems.length,
    isFinalizing,
    router,
    status,
    success,
    successParam,
    wompiTransactionId,
  ])

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
        const callbackUrl = shouldUseBuyNow ? "/checkout?directo=1" : "/checkout"
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
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
            items: checkoutItems.map((item) => ({
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
    [checkoutItems, couponCode, router, session?.user?.id, shouldUseBuyNow]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      const callbackUrl = shouldUseBuyNow ? "/checkout?directo=1" : "/checkout"
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
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
        items: checkoutItems.map((item) => ({
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
          : formData.paymentMethod === "WOMPI"
            ? "/api/checkout/wompi"
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
        throw new Error("No recibimos la URL de redirección.")
      }

      if (formData.paymentMethod === "WHATSAPP") {
        if (shouldUseBuyNow) {
          clearBuyNowCheckout()
          setBuyNowItem(null)
        } else {
          clearCart()
        }
        setOrderNumber(data.orderNumber || "")
      } else if (!shouldUseBuyNow) {
        clearBuyNowCheckout()
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
          Estamos validando la pasarela de pago para registrar tu pedido.
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
          Tu pedido ya quedó registrado correctamente y nuestro equipo ya puede darle seguimiento.
        </p>
        {orderNumber && (
          <p className="text-sm font-semibold text-lc-purple mb-8">
            Número de pedido: {orderNumber}
          </p>
        )}
        <Button onClick={() => router.push("/")} size="lg">
          Volver a la Tienda
        </Button>
      </div>
    )
  }

  if (!buyNowLoaded || checkoutItems.length === 0) {
    return null
  }

  const normalizedCouponCode = couponCode.trim().toUpperCase()
  const activeAppliedCoupon =
    appliedCoupon && appliedCoupon.code === normalizedCouponCode
      ? appliedCoupon
      : null
  const displayDiscount = activeAppliedCoupon?.discount ?? 0
  const displayTotal = activeAppliedCoupon?.total ?? checkoutTotal

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 animate-fade-in">
      <h1 className="mb-6 text-2xl font-heading font-bold text-lc-white sm:mb-8 sm:text-3xl">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="order-2 space-y-8 lg:order-1 lg:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {canceledParam && (
              <div className="rounded-lg border border-lc-warning/30 bg-lc-warning/10 p-4 text-sm text-lc-warning">
                Cancelaste la sesion de pago. Puedes revisar tus datos e intentarlo de nuevo.
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-lc-error/30 bg-lc-error/10 p-4 text-sm text-lc-error">
                {error}
              </div>
            )}

            {!session?.user?.id && status !== "loading" && (
              <div className="rounded-lg border border-lc-purple/30 bg-lc-purple/10 p-4 text-sm text-lc-gray-light">
                Necesitas iniciar sesion para crear la orden y continuar con el pago.
              </div>
            )}

            <div className="rounded-lg border border-lc-border bg-lc-dark p-5 sm:p-8">
              <h2 className="text-xl font-heading font-bold text-lc-white mb-6">
                1. Datos de envío
              </h2>
              <div className="mb-6 rounded-lg border border-lc-border bg-lc-darker/60 p-4">
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
                    label="Dirección"
                    required
                    placeholder="Calle, número, apartamento..."
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
                  label="Teléfono"
                  type="tel"
                  required
                  value={formData.shippingPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingPhone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="rounded-lg border border-lc-border bg-lc-dark p-5 sm:p-8">
              <h2 className="text-xl font-heading font-bold text-lc-white mb-6">
                2. Metodo de Pago
              </h2>
              <div className="space-y-4">
                {wompiEnabled && (
                  <label
                    className={`block p-4 border rounded-xl cursor-pointer transition-colors ${formData.paymentMethod === "WOMPI" ? "border-lc-cyan bg-lc-cyan/10" : "border-lc-border bg-lc-darker hover:border-lc-gray"}`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="payment"
                        value="WOMPI"
                        checked={formData.paymentMethod === "WOMPI"}
                        onChange={() =>
                          setFormData({ ...formData, paymentMethod: "WOMPI" })
                        }
                        className="mt-1 h-5 w-5 text-lc-cyan bg-lc-black border-lc-gray focus:ring-lc-cyan focus:ring-offset-lc-black"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-lc-white">
                          Wompi Colombia
                        </span>
                        <p className="mt-1 text-sm text-lc-gray">
                          Paga con PSE, tarjeta, Nequi y bancos disponibles dentro de Wompi.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <PaymentLogoBadge
                            label="Wompi"
                            src={paymentLogoPaths.wompi}
                            size="wide"
                          />
                          <PaymentLogoBadge
                            label="PSE"
                            src={paymentLogoPaths.pse}
                          />
                          <PaymentLogoBadge
                            label="Bancolombia"
                            src={paymentLogoPaths.bancolombia}
                            size="wide"
                          />
                          <PaymentLogoBadge
                            label="Davivienda"
                            src={paymentLogoPaths.davivienda}
                            size="wide"
                          />
                          <PaymentLogoBadge
                            label="Nequi"
                            src={paymentLogoPaths.nequi}
                          />
                          <PaymentLogoBadge
                            label="Visa"
                            src={paymentLogoPaths.visa}
                          />
                          <PaymentLogoBadge
                            label="Mastercard"
                            src={paymentLogoPaths.mastercard}
                          />
                        </div>
                      </div>
                    </div>
                  </label>
                )}

                {stripeEnabled && (
                  <label
                    className={`block p-4 border rounded-xl cursor-pointer transition-colors ${formData.paymentMethod === "STRIPE" ? "border-lc-purple bg-lc-purple/10" : "border-lc-border bg-lc-darker hover:border-lc-gray"}`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="payment"
                        value="STRIPE"
                        checked={formData.paymentMethod === "STRIPE"}
                        onChange={() =>
                          setFormData({ ...formData, paymentMethod: "STRIPE" })
                        }
                        className="mt-1 h-5 w-5 text-lc-purple bg-lc-black border-lc-gray focus:ring-lc-purple focus:ring-offset-lc-black"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-lc-white">
                          Tarjeta de Credito / Debito
                        </span>
                        <p className="mt-1 text-sm text-lc-gray">
                          Pago seguro e inmediato con tarjetas procesadas por Stripe.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <PaymentLogoBadge
                            label="Stripe"
                            src={paymentLogoPaths.stripe}
                            size="wide"
                          />
                          <PaymentLogoBadge
                            label="Visa"
                            src={paymentLogoPaths.visa}
                          />
                          <PaymentLogoBadge
                            label="Mastercard"
                            src={paymentLogoPaths.mastercard}
                          />
                          <PaymentLogoBadge
                            label="Amex"
                            src={paymentLogoPaths.amex}
                          />
                        </div>
                      </div>
                    </div>
                  </label>
                )}

                <label
                  className={`block p-4 border rounded-xl cursor-pointer transition-colors ${formData.paymentMethod === "WHATSAPP" ? "border-lc-success bg-lc-success/10" : "border-lc-border bg-lc-darker hover:border-lc-gray"}`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="radio"
                      name="payment"
                      value="WHATSAPP"
                      checked={formData.paymentMethod === "WHATSAPP"}
                      onChange={() =>
                        setFormData({ ...formData, paymentMethod: "WHATSAPP" })
                      }
                      className="mt-1 h-5 w-5 text-lc-success bg-lc-black border-lc-gray focus:ring-lc-success focus:ring-offset-lc-black"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-lc-white">
                        Contraentrega / asesor por WhatsApp
                      </span>
                      <p className="mt-1 text-sm text-lc-gray">
                        Ideal para pagar contraentrega o revisar opciones asistidas como Addi directamente con un asesor.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <PaymentLogoBadge
                          label="WhatsApp"
                          src={paymentLogoPaths.whatsapp}
                          size="square"
                        />
                        <PaymentTextBadge label="Contraentrega" />
                        <PaymentLogoBadge
                          label="Addi"
                          src={paymentLogoPaths.addi}
                          size="square"
                        />
                        <PaymentTextBadge label="Asesor" />
                      </div>
                    </div>
                  </div>
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

        <div className="order-1 lg:order-2 lg:col-span-5">
          <div className="rounded-lg border border-lc-border bg-lc-darker p-5 lg:sticky lg:top-28 lg:p-6">
            <h2 className="text-xl font-heading font-bold text-lc-white mb-6">Tu Pedido</h2>
            {shouldUseBuyNow ? (
              <div className="mb-5 rounded-lg border border-lc-purple/30 bg-lc-purple/10 px-4 py-3 text-sm font-semibold text-lc-purple-light">
                Compra directa: este checkout usa solo el producto seleccionado.
              </div>
            ) : null}

            <div className="mb-6 max-h-[240px] space-y-4 overflow-y-auto pr-2 custom-scrollbar sm:max-h-[300px]">
              {checkoutItems.map((item) => (
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
              <div className="rounded-lg border border-lc-border bg-lc-dark/70 p-4">
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
                <span>{formatCOP(checkoutTotal)}</span>
              </div>
              {displayDiscount > 0 ? (
                <div className="flex justify-between text-lc-success">
                  <span>Descuento</span>
                  <span>- {formatCOP(displayDiscount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-lc-gray-light">
                <span>Envío</span>
                <span className="text-lc-success">Gratis</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8 pt-6 border-t border-lc-border">
              <span className="text-lc-white font-bold text-lg">Total</span>
              <span className="text-3xl font-heading font-bold text-lc-white">
                {formatCOP(displayTotal)}
              </span>
            </div>

            <div className="mb-4">
              <label className="flex items-start gap-3 rounded-lg border border-lc-border bg-lc-dark/80 p-4 text-sm text-lc-gray-light">
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
              {!acceptedTerms ? (
                <p className="mt-2 text-xs font-semibold text-lc-gray">
                  Acepta las politicas para habilitar el boton y continuar.
                </p>
              ) : null}
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
                    : formData.paymentMethod === "WOMPI"
                      ? "Pagar con Wompi"
                      : "Coordinar por WhatsApp"}
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
