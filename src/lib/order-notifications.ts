import { Prisma } from "@prisma/client"
import {
  buildBrandedEmailHtml,
  sendBrandedMail,
} from "@/lib/mail"
import { prisma } from "@/lib/prisma"
import { getPaymentMethodLabel } from "@/lib/order-status"
import { formatCOP } from "@/lib/utils"

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "LilCake"

const orderNotificationSelect = {
  id: true,
  orderNumber: true,
  createdAt: true,
  status: true,
  paymentStatus: true,
  subtotal: true,
  discount: true,
  total: true,
  paymentMethod: true,
  shippingName: true,
  shippingAddress: true,
  shippingCity: true,
  shippingPhone: true,
  shippingCarrier: true,
  trackingNumber: true,
  customerEmail: true,
  confirmedAt: true,
  shippedAt: true,
  user: {
    select: {
      name: true,
      email: true,
    },
  },
  items: {
    select: {
      productName: true,
      productSize: true,
      productColor: true,
      quantity: true,
      unitPrice: true,
    },
  },
} as const satisfies Prisma.OrderSelect

type OrderNotificationRecord = Prisma.OrderGetPayload<{
  select: typeof orderNotificationSelect
}>

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "")
}

function buildOrderUrl(orderId: string) {
  return `${getAppUrl()}/cuenta/pedidos/${orderId}`
}

function getRecipientEmail(order: OrderNotificationRecord) {
  return order.customerEmail?.trim() || order.user.email?.trim() || null
}

function getRecipientName(order: OrderNotificationRecord) {
  return order.shippingName?.trim() || order.user.name?.trim() || "cliente"
}

function formatDateTime(date: Date | null | undefined) {
  if (!date) {
    return null
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date)
}

function getItemSummary(order: OrderNotificationRecord) {
  const itemCount = order.items.reduce((total, item) => total + item.quantity, 0)

  return `${itemCount} ${itemCount === 1 ? "articulo" : "articulos"}`
}

function buildEmailText({
  recipientName,
  intro,
  body,
  actionLabel,
  actionUrl,
  footer,
}: {
  recipientName: string
  intro: string
  body: string[]
  actionLabel: string
  actionUrl: string
  footer: string
}) {
  return [
    `Hola ${recipientName},`,
    "",
    intro,
    "",
    ...body,
    "",
    `${actionLabel}:`,
    actionUrl,
    "",
    footer,
  ].join("\n")
}

async function getOrderForNotification(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    select: orderNotificationSelect,
  })
}

async function claimReceiptNotification(orderId: string) {
  const claimedAt = new Date()
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      receiptEmailSentAt: null,
    },
    data: {
      receiptEmailSentAt: claimedAt,
    },
  })

  return result.count > 0 ? claimedAt : null
}

async function rollbackReceiptNotification(orderId: string, claimedAt: Date) {
  await prisma.order.updateMany({
    where: {
      id: orderId,
      receiptEmailSentAt: claimedAt,
    },
    data: {
      receiptEmailSentAt: null,
    },
  })
}

async function claimConfirmationNotification(orderId: string) {
  const claimedAt = new Date()
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      confirmationEmailSentAt: null,
      OR: [
        { paymentStatus: "PAID" },
        { status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] } },
      ],
    },
    data: {
      confirmationEmailSentAt: claimedAt,
    },
  })

  return result.count > 0 ? claimedAt : null
}

async function rollbackConfirmationNotification(orderId: string, claimedAt: Date) {
  await prisma.order.updateMany({
    where: {
      id: orderId,
      confirmationEmailSentAt: claimedAt,
    },
    data: {
      confirmationEmailSentAt: null,
    },
  })
}

async function claimShippingNotification(orderId: string) {
  const claimedAt = new Date()
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      shippingEmailSentAt: null,
      status: { in: ["SHIPPED", "DELIVERED"] },
    },
    data: {
      shippingEmailSentAt: claimedAt,
    },
  })

  return result.count > 0 ? claimedAt : null
}

async function rollbackShippingNotification(orderId: string, claimedAt: Date) {
  await prisma.order.updateMany({
    where: {
      id: orderId,
      shippingEmailSentAt: claimedAt,
    },
    data: {
      shippingEmailSentAt: null,
    },
  })
}

async function sendClaimedOrderEmail({
  orderId,
  claim,
  rollback,
  buildMessage,
}: {
  orderId: string
  claim: (orderId: string) => Promise<Date | null>
  rollback: (orderId: string, claimedAt: Date) => Promise<void>
  buildMessage: (order: OrderNotificationRecord) => {
    subject: string
    textIntro: string
    textBody: string[]
    actionLabel: string
    footer: string
    branded: {
      preheader: string
      eyebrow: string
      title: string
      intro: string
      body: string[]
      action: {
        href: string
        label: string
      }
      footerNote: string
      brandDescription: string
    }
  } | null
}) {
  const claimedAt = await claim(orderId)

  if (!claimedAt) {
    return { sent: false as const, reason: "already-sent" as const }
  }

  try {
    const order = await getOrderForNotification(orderId)

    if (!order) {
      await rollback(orderId, claimedAt)

      return { sent: false as const, reason: "missing-order" as const }
    }

    const recipientEmail = getRecipientEmail(order)

    if (!recipientEmail) {
      await rollback(orderId, claimedAt)

      return { sent: false as const, reason: "missing-email" as const }
    }

    const message = buildMessage(order)

    if (!message) {
      await rollback(orderId, claimedAt)

      return { sent: false as const, reason: "not-applicable" as const }
    }

    const orderUrl = buildOrderUrl(order.id)
    const recipientName = getRecipientName(order)

    await sendBrandedMail({
      to: recipientEmail,
      subject: message.subject,
      text: buildEmailText({
        recipientName,
        intro: message.textIntro,
        body: message.textBody,
        actionLabel: message.actionLabel,
        actionUrl: orderUrl,
        footer: message.footer,
      }),
      html: buildBrandedEmailHtml(message.branded),
      branded: message.branded,
    })

    return { sent: true as const }
  } catch (error) {
    await rollback(orderId, claimedAt)
    throw error
  }
}

export async function sendOrderReceivedEmail(orderId: string) {
  return sendClaimedOrderEmail({
    orderId,
    claim: claimReceiptNotification,
    rollback: rollbackReceiptNotification,
    buildMessage: (order) => {
      if (order.paymentMethod !== "WHATSAPP") {
        return null
      }

      const recipientName = getRecipientName(order)
      const orderUrl = buildOrderUrl(order.id)

      return {
        subject: `${APP_NAME}: recibimos tu pedido ${order.orderNumber}`,
        textIntro: "Ya registramos tu pedido y dejamos listo el resumen para que sigas con la coordinacion del pago.",
        textBody: [
          `Pedido: ${order.orderNumber}`,
          `Resumen: ${getItemSummary(order)} por ${formatCOP(order.total)}.`,
          `Metodo de pago elegido: ${getPaymentMethodLabel(order.paymentMethod)}.`,
          `Destino: ${order.shippingAddress}, ${order.shippingCity}.`,
        ],
        actionLabel: "Revisa tu pedido aqui",
        footer: "Si necesitas ayuda, responde por WhatsApp o revisa el detalle de tu pedido desde tu cuenta.",
        branded: {
          preheader: `Recibimos tu pedido ${order.orderNumber}`,
          eyebrow: "Pedido recibido",
          title: "Tu pedido ya esta registrado",
          intro: `Hola ${recipientName}, ya registramos tu pedido y dejamos listos los datos para continuar con la compra.`,
          body: [
            `Resumen: ${getItemSummary(order)} por ${formatCOP(order.total)}.`,
            "Elegiste coordinacion por WhatsApp o transferencia, asi que puedes retomar el pedido cuando quieras desde tu cuenta.",
            `Destino registrado: ${order.shippingAddress}, ${order.shippingCity}.`,
          ],
          action: {
            href: orderUrl,
            label: "Ver mi pedido",
          },
          footerNote:
            "Este correo confirma que tu pedido quedo creado. El pago y el despacho se coordinan por separado.",
          brandDescription: "Pedidos y envios",
        },
      }
    },
  })
}

export async function sendOrderConfirmationEmail(orderId: string) {
  return sendClaimedOrderEmail({
    orderId,
    claim: claimConfirmationNotification,
    rollback: rollbackConfirmationNotification,
    buildMessage: (order) => {
      const recipientName = getRecipientName(order)
      const orderUrl = buildOrderUrl(order.id)
      const confirmedAt = formatDateTime(order.confirmedAt)
      const paymentLabel = getPaymentMethodLabel(order.paymentMethod)
      const intro =
        order.paymentStatus === "PAID"
          ? `Hola ${recipientName}, confirmamos el pago de tu pedido y ya estamos preparandolo para despacho.`
          : `Hola ${recipientName}, tu pedido ya quedo confirmado y estamos preparando el siguiente paso del envio.`

      return {
        subject: `${APP_NAME}: pedido confirmado ${order.orderNumber}`,
        textIntro:
          order.paymentStatus === "PAID"
            ? "Confirmamos el pago de tu pedido y ya estamos preparando el despacho."
            : "Tu pedido ya quedo confirmado y seguimos avanzando con la preparacion.",
        textBody: [
          `Pedido: ${order.orderNumber}`,
          `Total: ${formatCOP(order.total)}.`,
          `Metodo de pago: ${paymentLabel}.`,
          ...(confirmedAt ? [`Confirmado el: ${confirmedAt}.`] : []),
          `Destino: ${order.shippingAddress}, ${order.shippingCity}.`,
        ],
        actionLabel: "Sigue tu pedido aqui",
        footer: "Cuando despachemos tu compra, te enviaremos otro correo con la transportadora y la guia.",
        branded: {
          preheader: `Tu pedido ${order.orderNumber} ya esta confirmado`,
          eyebrow: "Pedido confirmado",
          title: "Ya estamos preparando tu pedido",
          intro,
          body: [
            `Resumen: ${getItemSummary(order)} por ${formatCOP(order.total)}.`,
            `Metodo de pago: ${paymentLabel}.`,
            ...(confirmedAt ? [`Confirmado el ${confirmedAt}.`] : []),
            `Direccion de envio: ${order.shippingAddress}, ${order.shippingCity}.`,
          ],
          action: {
            href: orderUrl,
            label: "Ver seguimiento",
          },
          footerNote:
            "Te avisaremos automaticamente cuando el pedido pase a enviado y ya tenga transportadora y numero de guia.",
          brandDescription: "Pedidos y envios",
        },
      }
    },
  })
}

export async function sendOrderShippedEmail(orderId: string) {
  return sendClaimedOrderEmail({
    orderId,
    claim: claimShippingNotification,
    rollback: rollbackShippingNotification,
    buildMessage: (order) => {
      if (!order.shippingCarrier?.trim() || !order.trackingNumber?.trim()) {
        return null
      }

      const recipientName = getRecipientName(order)
      const orderUrl = buildOrderUrl(order.id)
      const shippedAt = formatDateTime(order.shippedAt)

      return {
        subject: `${APP_NAME}: tu pedido ${order.orderNumber} ya fue enviado`,
        textIntro: "Tu pedido ya fue despachado y te compartimos los datos del envio.",
        textBody: [
          `Pedido: ${order.orderNumber}`,
          `Transportadora: ${order.shippingCarrier}.`,
          `Numero de guia: ${order.trackingNumber}.`,
          ...(shippedAt ? [`Despachado el: ${shippedAt}.`] : []),
          `Destino: ${order.shippingAddress}, ${order.shippingCity}.`,
        ],
        actionLabel: "Consulta tu pedido aqui",
        footer: "Guarda este correo para revisar la transportadora y la guia cuando lo necesites.",
        branded: {
          preheader: `Tu pedido ${order.orderNumber} ya va en camino`,
          eyebrow: "Pedido enviado",
          title: "Tu compra ya va en camino",
          intro: `Hola ${recipientName}, ya entregamos tu pedido a ${order.shippingCarrier}.`,
          body: [
            `Numero de guia: ${order.trackingNumber}.`,
            ...(shippedAt ? [`Despachado el ${shippedAt}.`] : []),
            `Destino registrado: ${order.shippingAddress}, ${order.shippingCity}.`,
            "Puedes volver a tu cuenta cuando quieras para consultar estos mismos datos del envio.",
          ],
          action: {
            href: orderUrl,
            label: "Ver envio",
          },
          footerNote:
            "Si la transportadora actualiza el recorrido, puedes usar la guia desde tu panel de cliente para identificar el paquete.",
          brandDescription: "Pedidos y envios",
        },
      }
    },
  })
}
