import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  WOMPI_CURRENCY,
  WOMPI_PROVIDER,
  buildWompiCheckoutUrl,
  getPublicWompiStatus,
  toWompiAmountInCents,
  type WompiTransaction,
} from "@/lib/wompi"

type WompiCheckoutOrder = {
  id: string
  orderNumber: string
  total: number
  customerEmail: string | null
  shippingName: string
  shippingPhone: string
}

function buildWompiReference(orderNumber: string, attempt: number) {
  return `${orderNumber}-W${attempt}`
}

export async function createOrReuseWompiCheckout({
  order,
  origin,
  returnPath = "/checkout?provider=wompi",
}: {
  order: WompiCheckoutOrder
  origin: string
  returnPath?: string
}) {
  const existingPendingPayment = await prisma.paymentTransaction.findFirst({
    where: {
      orderId: order.id,
      provider: WOMPI_PROVIDER,
      status: "PENDING",
      checkoutUrl: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (existingPendingPayment?.checkoutUrl) {
    const redirectUrl = new URL(returnPath, origin)
    redirectUrl.searchParams.set("reference", existingPendingPayment.providerReference)
    const checkoutUrl = buildWompiCheckoutUrl({
      reference: existingPendingPayment.providerReference,
      amountInCents: existingPendingPayment.amountInCents,
      redirectUrl: redirectUrl.toString(),
      customerEmail: order.customerEmail || "",
      customerName: order.shippingName,
      customerPhone: order.shippingPhone,
    })

    if (checkoutUrl !== existingPendingPayment.checkoutUrl) {
      await prisma.paymentTransaction.update({
        where: { id: existingPendingPayment.id },
        data: { checkoutUrl },
      })
    }

    return {
      url: checkoutUrl,
      reference: existingPendingPayment.providerReference,
    }
  }

  const attempt = await prisma.paymentTransaction.count({
    where: {
      orderId: order.id,
      provider: WOMPI_PROVIDER,
    },
  })
  const reference = buildWompiReference(order.orderNumber, attempt + 1)
  const amountInCents = toWompiAmountInCents(order.total)
  const redirectUrl = new URL(returnPath, origin)
  redirectUrl.searchParams.set("reference", reference)
  const checkoutUrl = buildWompiCheckoutUrl({
    reference,
    amountInCents,
    redirectUrl: redirectUrl.toString(),
    customerEmail: order.customerEmail || "",
    customerName: order.shippingName,
    customerPhone: order.shippingPhone,
  })

  await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      provider: WOMPI_PROVIDER,
      providerReference: reference,
      status: "PENDING",
      amountInCents,
      currency: WOMPI_CURRENCY,
      checkoutUrl,
    },
  })

  return {
    url: checkoutUrl,
    reference,
  }
}

export async function findOrderForWompiTransaction(transaction: WompiTransaction) {
  const payment = await prisma.paymentTransaction.findFirst({
    where: {
      provider: WOMPI_PROVIDER,
      OR: [
        { providerReference: transaction.reference },
        { providerTransactionId: transaction.id },
      ],
    },
    include: {
      order: {
        select: {
          id: true,
          userId: true,
          orderNumber: true,
          paymentStatus: true,
          status: true,
          total: true,
        },
      },
    },
  })

  return payment
}

export async function findCustomerWompiPaymentByReference(
  userId: string,
  reference: string
) {
  return prisma.paymentTransaction.findFirst({
    where: {
      provider: WOMPI_PROVIDER,
      providerReference: reference,
      order: {
        userId,
      },
    },
    include: {
      order: {
        select: {
          id: true,
          userId: true,
          orderNumber: true,
          paymentStatus: true,
          status: true,
          total: true,
        },
      },
    },
  })
}

export async function findCustomerWompiPaymentByTransactionId(
  userId: string,
  transactionId: string
) {
  return prisma.paymentTransaction.findFirst({
    where: {
      provider: WOMPI_PROVIDER,
      providerTransactionId: transactionId,
      order: {
        userId,
      },
    },
    include: {
      order: {
        select: {
          id: true,
          userId: true,
          orderNumber: true,
          paymentStatus: true,
          status: true,
          total: true,
        },
      },
    },
  })
}

export function validateWompiTransactionForOrder({
  transaction,
  amountInCents,
}: {
  transaction: WompiTransaction
  amountInCents: number
}) {
  if (transaction.currency !== WOMPI_CURRENCY) {
    throw new Error(
      `La transaccion ${transaction.id} no esta en moneda ${WOMPI_CURRENCY}.`
    )
  }

  if (transaction.amount_in_cents !== amountInCents) {
    throw new Error(
      `La transaccion ${transaction.id} no coincide con el total esperado.`
    )
  }
}

export async function updateWompiPaymentTransaction({
  transaction,
  payload,
}: {
  transaction: WompiTransaction
  payload?: unknown
}) {
  return prisma.paymentTransaction.updateMany({
    where: {
      provider: WOMPI_PROVIDER,
      providerReference: transaction.reference,
    },
    data: {
      providerTransactionId: transaction.id,
      status: getPublicWompiStatus(transaction.status).toUpperCase(),
      rawStatus: transaction.status,
      paymentMethodType: transaction.payment_method_type || null,
      payload: payload
        ? (payload as Prisma.InputJsonValue)
        : (transaction as Prisma.InputJsonValue),
    },
  })
}
