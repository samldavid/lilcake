import { Prisma } from "@prisma/client"
import {
  PDFDocument,
  PDFPage,
  StandardFonts,
  rgb,
  type PDFFont,
} from "pdf-lib"
import {
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "@/lib/order-status"
import { formatCOP } from "@/lib/utils"

export const salesNoteOrderSelect = {
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
  coupon: {
    select: {
      code: true,
    },
  },
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

export type SalesNoteOrderRecord = Prisma.OrderGetPayload<{
  select: typeof salesNoteOrderSelect
}>

type SalesNoteOrderLike = {
  id: string
  orderNumber: string
  createdAt: Date
  status: string
  paymentStatus: string
  subtotal: number
  discount: number
  total: number
  paymentMethod: string
  shippingName: string
  shippingAddress: string
  shippingCity: string
  shippingPhone: string
  shippingCarrier: string | null
  trackingNumber: string | null
  customerEmail: string | null
  confirmedAt: Date | null
  shippedAt: Date | null
  coupon?: { code: string } | null
  user: {
    name: string | null
    email: string | null
  }
  items: Array<{
    productName: string
    productSize: string | null
    productColor: string | null
    quantity: number
    unitPrice: number
  }>
}

type PdfFonts = {
  regular: PDFFont
  bold: PDFFont
}

const PAGE_SIZE: [number, number] = [595.28, 841.89]
const MARGIN = 42
const BRAND_PURPLE = rgb(0.42, 0.24, 0.88)
const BRAND_PINK = rgb(0.91, 0.12, 0.55)
const INK = rgb(0.08, 0.08, 0.13)
const MUTED = rgb(0.43, 0.45, 0.55)
const LIGHT_BG = rgb(0.96, 0.96, 0.99)
const BORDER = rgb(0.84, 0.84, 0.9)

function getIssuer() {
  return {
    name:
      process.env.SALES_NOTE_BUSINESS_NAME ||
      process.env.NEXT_PUBLIC_APP_NAME ||
      "LilCake",
    identification:
      process.env.SALES_NOTE_BUSINESS_ID || "Identificacion no configurada",
    email:
      process.env.SALES_NOTE_BUSINESS_EMAIL ||
      process.env.SMTP_USER ||
      "correo no configurado",
    phone: process.env.SALES_NOTE_BUSINESS_PHONE || "",
    address: process.env.SALES_NOTE_BUSINESS_ADDRESS || "",
  }
}

function formatDateTime(date: Date | null | undefined) {
  if (!date) {
    return "Pendiente"
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function cleanFileToken(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-")
}

function safeText(value: string | number | null | undefined) {
  return `${value ?? ""}`.replace(/\s+/g, " ").trim()
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color = INK
) {
  page.drawText(safeText(text), {
    x,
    y,
    size,
    font,
    color,
  })
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = safeText(text).split(" ")
  const lines: string[] = []
  let line = ""

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word
    const width = font.widthOfTextAtSize(nextLine, size)

    if (width <= maxWidth) {
      line = nextLine
      continue
    }

    if (line) {
      lines.push(line)
    }

    line = word
  }

  if (line) {
    lines.push(line)
  }

  return lines.length ? lines : [""]
}

function drawWrappedText({
  page,
  text,
  x,
  y,
  font,
  size,
  maxWidth,
  color = INK,
  lineHeight = size + 4,
}: {
  page: PDFPage
  text: string
  x: number
  y: number
  font: PDFFont
  size: number
  maxWidth: number
  color?: ReturnType<typeof rgb>
  lineHeight?: number
}) {
  const lines = wrapText(text, font, size, maxWidth)
  let nextY = y

  for (const line of lines) {
    drawText(page, line, x, nextY, font, size, color)
    nextY -= lineHeight
  }

  return nextY
}

function drawLabelValue({
  page,
  label,
  value,
  x,
  y,
  width,
  fonts,
}: {
  page: PDFPage
  label: string
  value: string
  x: number
  y: number
  width: number
  fonts: PdfFonts
}) {
  drawText(page, label, x, y, fonts.bold, 8, MUTED)

  return drawWrappedText({
    page,
    text: value || "No registrado",
    x,
    y: y - 14,
    font: fonts.regular,
    size: 10,
    maxWidth: width,
    lineHeight: 13,
  })
}

function drawHeader(page: PDFPage, fonts: PdfFonts, order: SalesNoteOrderLike) {
  const issuer = getIssuer()
  const width = page.getWidth()
  const top = page.getHeight() - MARGIN

  page.drawRectangle({
    x: 0,
    y: page.getHeight() - 134,
    width,
    height: 134,
    color: rgb(0.08, 0.08, 0.14),
  })
  page.drawRectangle({
    x: 0,
    y: page.getHeight() - 134,
    width: 8,
    height: 134,
    color: BRAND_PURPLE,
  })
  page.drawCircle({
    x: width - 72,
    y: page.getHeight() - 46,
    size: 64,
    color: rgb(0.17, 0.12, 0.32),
  })

  page.drawRectangle({
    x: MARGIN,
    y: top - 48,
    width: 46,
    height: 46,
    borderColor: rgb(0.31, 0.24, 0.55),
    borderWidth: 1,
    color: BRAND_PURPLE,
  })
  drawText(page, "LC", MARGIN + 11, top - 31, fonts.bold, 16, rgb(1, 1, 1))
  drawText(page, issuer.name, MARGIN + 60, top - 19, fonts.bold, 20, rgb(1, 1, 1))
  drawText(
    page,
    issuer.identification,
    MARGIN + 60,
    top - 38,
    fonts.regular,
    9,
    rgb(0.76, 0.78, 0.86)
  )

  drawText(page, "NOTA DE VENTA", width - 198, top - 15, fonts.bold, 19, rgb(1, 1, 1))
  drawText(
    page,
    buildSalesNoteNumber(order.orderNumber),
    width - 198,
    top - 35,
    fonts.regular,
    10,
    rgb(0.76, 0.78, 0.86)
  )
  drawText(
    page,
    "Comprobante interno de pedido",
    width - 198,
    top - 52,
    fonts.regular,
    9,
    rgb(0.62, 0.66, 0.78)
  )
}

function drawFooter(page: PDFPage, fonts: PdfFonts, pageNumber: number) {
  const y = 32

  page.drawLine({
    start: { x: MARGIN, y: y + 16 },
    end: { x: page.getWidth() - MARGIN, y: y + 16 },
    thickness: 0.5,
    color: BORDER,
  })
  drawText(
    page,
    "Este documento no es factura de venta ni documento equivalente DIAN.",
    MARGIN,
    y,
    fonts.regular,
    8,
    MUTED
  )
  drawText(
    page,
    `Pagina ${pageNumber}`,
    page.getWidth() - MARGIN - 44,
    y,
    fonts.regular,
    8,
    MUTED
  )
}

function addPage(pdfDoc: PDFDocument, fonts: PdfFonts, order: SalesNoteOrderLike, pageNumber: number) {
  const page = pdfDoc.addPage(PAGE_SIZE)
  drawHeader(page, fonts, order)
  drawFooter(page, fonts, pageNumber)

  return page
}

export function buildSalesNoteNumber(orderNumber: string) {
  return `NV-${orderNumber}`
}

export function buildSalesNoteFileName(orderNumber: string) {
  return `nota-venta-${cleanFileToken(orderNumber)}.pdf`
}

export async function generateSalesNotePdf(order: SalesNoteOrderLike) {
  const pdfDoc = await PDFDocument.create()
  const fonts: PdfFonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  }
  let pageNumber = 1
  let page = addPage(pdfDoc, fonts, order, pageNumber)
  let y = page.getHeight() - 166
  const contentWidth = page.getWidth() - MARGIN * 2
  const halfWidth = (contentWidth - 18) / 2
  const issuer = getIssuer()
  const customerEmail = order.customerEmail || order.user.email || "Sin email"

  page.drawRectangle({
    x: MARGIN,
    y: y - 108,
    width: contentWidth,
    height: 108,
    color: LIGHT_BG,
    borderColor: BORDER,
    borderWidth: 0.7,
  })

  drawText(page, "Datos del negocio", MARGIN + 18, y - 22, fonts.bold, 12, BRAND_PURPLE)
  drawText(page, issuer.name, MARGIN + 18, y - 42, fonts.bold, 11, INK)
  drawWrappedText({
    page,
    text: [issuer.identification, issuer.email, issuer.phone, issuer.address]
      .filter(Boolean)
      .join(" | "),
    x: MARGIN + 18,
    y: y - 58,
    font: fonts.regular,
    size: 9,
    maxWidth: halfWidth - 20,
    color: MUTED,
    lineHeight: 12,
  })

  drawText(page, "Datos del cliente", MARGIN + 18 + halfWidth + 18, y - 22, fonts.bold, 12, BRAND_PINK)
  drawText(page, order.shippingName || order.user.name || "Cliente", MARGIN + 18 + halfWidth + 18, y - 42, fonts.bold, 11, INK)
  drawWrappedText({
    page,
    text: `${customerEmail} | ${order.shippingPhone} | ${order.shippingAddress}, ${order.shippingCity}`,
    x: MARGIN + 18 + halfWidth + 18,
    y: y - 58,
    font: fonts.regular,
    size: 9,
    maxWidth: halfWidth - 20,
    color: MUTED,
    lineHeight: 12,
  })

  y -= 134

  const metaColumns = [
    ["Pedido", order.orderNumber],
    ["Fecha de pedido", formatDateTime(order.createdAt)],
    ["Estado", getOrderStatusLabel(order.status)],
    ["Pago", getPaymentStatusLabel(order.paymentStatus)],
    ["Metodo", getPaymentMethodLabel(order.paymentMethod)],
    ["Confirmado", formatDateTime(order.confirmedAt)],
  ]
  const metaWidth = contentWidth / 3

  for (let index = 0; index < metaColumns.length; index += 1) {
    const [label, value] = metaColumns[index]
    const col = index % 3
    const row = Math.floor(index / 3)
    drawLabelValue({
      page,
      label,
      value,
      x: MARGIN + col * metaWidth,
      y: y - row * 50,
      width: metaWidth - 16,
      fonts,
    })
  }

  y -= 114

  drawText(page, "Productos", MARGIN, y, fonts.bold, 14, INK)
  y -= 24

  const tableTop = y + 9
  page.drawRectangle({
    x: MARGIN,
    y: tableTop - 22,
    width: contentWidth,
    height: 24,
    color: BRAND_PURPLE,
  })

  const columns = {
    product: MARGIN + 12,
    quantity: MARGIN + 296,
    unit: MARGIN + 352,
    total: MARGIN + 440,
  }

  drawText(page, "Producto", columns.product, tableTop - 14, fonts.bold, 9, rgb(1, 1, 1))
  drawText(page, "Cant.", columns.quantity, tableTop - 14, fonts.bold, 9, rgb(1, 1, 1))
  drawText(page, "Unitario", columns.unit, tableTop - 14, fonts.bold, 9, rgb(1, 1, 1))
  drawText(page, "Total", columns.total, tableTop - 14, fonts.bold, 9, rgb(1, 1, 1))

  y -= 28

  for (const item of order.items) {
    if (y < 118) {
      pageNumber += 1
      page = addPage(pdfDoc, fonts, order, pageNumber)
      y = page.getHeight() - 166
    }

    const variantLabel = [item.productSize, item.productColor]
      .filter(Boolean)
      .join(" - ")
    const rowHeight = 46

    page.drawRectangle({
      x: MARGIN,
      y: y - rowHeight + 7,
      width: contentWidth,
      height: rowHeight,
      color: rgb(0.985, 0.985, 1),
      borderColor: BORDER,
      borderWidth: 0.4,
    })

    drawWrappedText({
      page,
      text: `${item.productName}${variantLabel ? ` (${variantLabel})` : ""}`,
      x: columns.product,
      y: y - 8,
      font: fonts.bold,
      size: 9,
      maxWidth: 254,
      lineHeight: 11,
    })
    drawText(page, `${item.quantity}`, columns.quantity, y - 12, fonts.regular, 9, INK)
    drawText(page, formatCOP(item.unitPrice), columns.unit, y - 12, fonts.regular, 9, INK)
    drawText(
      page,
      formatCOP(item.unitPrice * item.quantity),
      columns.total,
      y - 12,
      fonts.bold,
      9,
      INK
    )

    y -= rowHeight + 6
  }

  if (y < 240) {
    pageNumber += 1
    page = addPage(pdfDoc, fonts, order, pageNumber)
    y = page.getHeight() - 166
  }

  const summaryX = page.getWidth() - MARGIN - 218
  page.drawRectangle({
    x: summaryX,
    y: y - 112,
    width: 218,
    height: 112,
    color: LIGHT_BG,
    borderColor: BORDER,
    borderWidth: 0.7,
  })
  drawText(page, "Resumen", summaryX + 18, y - 24, fonts.bold, 12, INK)
  drawText(page, "Subtotal", summaryX + 18, y - 46, fonts.regular, 9, MUTED)
  drawText(page, formatCOP(order.subtotal), summaryX + 122, y - 46, fonts.regular, 9, INK)
  drawText(page, "Descuento", summaryX + 18, y - 66, fonts.regular, 9, MUTED)
  drawText(page, `- ${formatCOP(order.discount)}`, summaryX + 122, y - 66, fonts.regular, 9, INK)
  drawText(page, "Total", summaryX + 18, y - 92, fonts.bold, 13, INK)
  drawText(page, formatCOP(order.total), summaryX + 122, y - 92, fonts.bold, 13, BRAND_PURPLE)

  drawText(page, "Envio", MARGIN, y - 20, fonts.bold, 12, INK)
  drawWrappedText({
    page,
    text: `Direccion: ${order.shippingAddress}, ${order.shippingCity}. Transportadora: ${order.shippingCarrier || "Pendiente"}. Guia: ${order.trackingNumber || "Pendiente"}.`,
    x: MARGIN,
    y: y - 42,
    font: fonts.regular,
    size: 9,
    maxWidth: summaryX - MARGIN - 24,
    color: MUTED,
    lineHeight: 13,
  })

  const disclaimerY = y - 152
  page.drawRectangle({
    x: MARGIN,
    y: disclaimerY - 62,
    width: contentWidth,
    height: 62,
    color: rgb(1, 0.97, 0.9),
    borderColor: rgb(0.95, 0.76, 0.35),
    borderWidth: 0.7,
  })
  drawText(page, "Importante", MARGIN + 18, disclaimerY - 20, fonts.bold, 11, rgb(0.48, 0.31, 0.02))
  drawWrappedText({
    page,
    text:
      "Esta nota de venta es un comprobante interno del pedido. No reemplaza factura electronica de venta ni documento equivalente DIAN. Si el negocio esta obligado a facturar, debe emitir la factura electronica por el medio autorizado correspondiente.",
    x: MARGIN + 18,
    y: disclaimerY - 37,
    font: fonts.regular,
    size: 8.5,
    maxWidth: contentWidth - 36,
    color: rgb(0.48, 0.31, 0.02),
    lineHeight: 11,
  })

  const bytes = await pdfDoc.save()
  return Buffer.from(bytes)
}
