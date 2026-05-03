import crypto from "crypto"

export const WOMPI_PROVIDER = "WOMPI"
export const WOMPI_CURRENCY = "COP"

type WompiEnvironment = "sandbox" | "production"

export type WompiTransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "ERROR"
  | string

export type WompiTransaction = {
  id: string
  reference: string
  amount_in_cents: number
  currency: string
  customer_email?: string | null
  payment_method_type?: string | null
  status: WompiTransactionStatus
  status_message?: string | null
}

type WompiApiResponse<T> = {
  data?: T
  error?: {
    type?: string
    reason?: string
    messages?: unknown
  }
}

type WompiEventPayload = {
  event?: string
  data?: Record<string, unknown>
  environment?: string
  signature?: {
    properties?: string[]
    checksum?: string
  }
  timestamp?: number
  sent_at?: string
}

function getWompiEnvironment(): WompiEnvironment {
  const explicitEnvironment = process.env.WOMPI_ENVIRONMENT?.toLowerCase()

  if (explicitEnvironment === "production") {
    return "production"
  }

  if (explicitEnvironment === "sandbox") {
    return "sandbox"
  }

  const publicKey = getWompiPublicKey({ required: false })

  return publicKey?.startsWith("pub_prod_") ? "production" : "sandbox"
}

export function isWompiConfigured() {
  return Boolean(
    getWompiPublicKey({ required: false }) &&
      process.env.WOMPI_INTEGRITY_SECRET &&
      process.env.WOMPI_EVENTS_SECRET
  )
}

export function isWompiCheckoutEnabled() {
  return (
    process.env.NEXT_PUBLIC_WOMPI_ENABLED === "true" &&
    isWompiConfigured()
  )
}

export function getWompiPublicKey(options: { required?: boolean } = {}) {
  const publicKey =
    process.env.WOMPI_PUBLIC_KEY || process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY

  if (!publicKey && options.required !== false) {
    throw new Error(
      "Wompi no esta configurado. Agrega la llave publica para habilitar pagos."
    )
  }

  return publicKey || ""
}

function getWompiIntegritySecret() {
  if (!process.env.WOMPI_INTEGRITY_SECRET) {
    throw new Error(
      "Falta WOMPI_INTEGRITY_SECRET para generar la firma de integridad."
    )
  }

  return process.env.WOMPI_INTEGRITY_SECRET
}

function getWompiEventsSecret() {
  if (!process.env.WOMPI_EVENTS_SECRET) {
    throw new Error("Falta WOMPI_EVENTS_SECRET para verificar eventos.")
  }

  return process.env.WOMPI_EVENTS_SECRET
}

export function getWompiApiBaseUrl() {
  return getWompiEnvironment() === "production"
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1"
}

function sha256Hex(value: string, uppercase = false) {
  const hash = crypto.createHash("sha256").update(value).digest("hex")

  return uppercase ? hash.toUpperCase() : hash
}

export function toWompiAmountInCents(amount: number) {
  const cents = Math.round(amount * 100)

  if (!Number.isInteger(cents) || cents <= 0) {
    throw new Error("El monto de Wompi debe ser un entero positivo en centavos.")
  }

  return cents
}

export function createWompiIntegritySignature({
  reference,
  amountInCents,
  currency = WOMPI_CURRENCY,
  expirationTime,
}: {
  reference: string
  amountInCents: number
  currency?: string
  expirationTime?: string
}) {
  const secret = getWompiIntegritySecret()
  const value = expirationTime
    ? `${reference}${amountInCents}${currency}${expirationTime}${secret}`
    : `${reference}${amountInCents}${currency}${secret}`

  return sha256Hex(value)
}

function normalizePhoneNumber(phone: string) {
  return phone.replace(/[^\d]/g, "")
}

export function buildWompiCheckoutUrl({
  reference,
  amountInCents,
  redirectUrl,
  customerEmail,
  customerName,
  customerPhone,
}: {
  reference: string
  amountInCents: number
  redirectUrl: string
  customerEmail: string
  customerName: string
  customerPhone: string
}) {
  const url = new URL("https://checkout.wompi.co/p/")
  const normalizedPhone = normalizePhoneNumber(customerPhone)

  url.searchParams.set("public-key", getWompiPublicKey())
  url.searchParams.set("currency", WOMPI_CURRENCY)
  url.searchParams.set("amount-in-cents", `${amountInCents}`)
  url.searchParams.set("reference", reference)
  url.searchParams.set(
    "signature:integrity",
    createWompiIntegritySignature({ reference, amountInCents })
  )
  url.searchParams.set("redirect-url", redirectUrl)
  url.searchParams.set("customer-data:email", customerEmail)
  url.searchParams.set("customer-data:full-name", customerName)

  if (normalizedPhone) {
    url.searchParams.set("customer-data:phone-number", normalizedPhone)
    url.searchParams.set("customer-data:phone-number-prefix", "+57")
  }

  return url.toString()
}

function readPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") {
      return undefined
    }

    return (current as Record<string, unknown>)[segment]
  }, source)
}

function safeTimingCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  )
}

export function verifyWompiEventSignature(
  payload: WompiEventPayload,
  checksumHeader: string | null
) {
  const properties = payload.signature?.properties
  const timestamp = payload.timestamp
  const checksum = checksumHeader || payload.signature?.checksum

  if (!Array.isArray(properties) || !checksum || typeof timestamp !== "number") {
    return false
  }

  const data = payload.data || {}
  const propertyValues = properties.map((property) => {
    const value = readPath(data, property)

    if (value === undefined || value === null) {
      return ""
    }

    return `${value}`
  })
  const expectedChecksum = sha256Hex(
    `${propertyValues.join("")}${timestamp}${getWompiEventsSecret()}`,
    true
  )

  return safeTimingCompare(expectedChecksum, checksum.toUpperCase())
}

export function getWompiTransactionFromEvent(payload: WompiEventPayload) {
  const transaction = (payload.data as { transaction?: unknown } | undefined)
    ?.transaction

  if (!transaction || typeof transaction !== "object") {
    return null
  }

  return transaction as WompiTransaction
}

export async function fetchWompiTransaction(transactionId: string) {
  const response = await fetch(
    `${getWompiApiBaseUrl()}/transactions/${encodeURIComponent(transactionId)}`,
    {
      headers: {
        Authorization: `Bearer ${getWompiPublicKey()}`,
      },
      cache: "no-store",
    }
  )
  const body = (await response.json()) as WompiApiResponse<WompiTransaction>

  if (!response.ok || !body.data) {
    const reason =
      body.error?.reason ||
      `Wompi respondio con estado HTTP ${response.status}.`

    throw new Error(reason)
  }

  return body.data
}

export function getPublicWompiStatus(status: string) {
  switch (status) {
    case "APPROVED":
      return "paid"
    case "DECLINED":
    case "VOIDED":
    case "ERROR":
      return "failed"
    default:
      return "pending"
  }
}
