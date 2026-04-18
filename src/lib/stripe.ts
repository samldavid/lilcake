import Stripe from "stripe"

let stripeClient: Stripe | null = null

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
])

export function isStripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Stripe no esta configurado todavia. Agrega STRIPE_SECRET_KEY para habilitar pagos."
    )
  }

  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-03-25.dahlia",
    typescript: true,
  })

  return stripeClient
}

export function getStripeProductImages(
  image: string | null | undefined,
  origin: string
) {
  if (!image) {
    return []
  }

  try {
    return [new URL(image, origin).toString()]
  } catch {
    return []
  }
}

export function getStripeUnitAmount(amount: number, currency: string) {
  const normalizedCurrency = currency.toLowerCase()

  return ZERO_DECIMAL_CURRENCIES.has(normalizedCurrency)
    ? Math.round(amount)
    : Math.round(amount * 100)
}
