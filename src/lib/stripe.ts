import Stripe from "stripe"

let stripeClient: Stripe | null = null

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
