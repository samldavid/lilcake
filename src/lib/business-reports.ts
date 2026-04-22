import ExcelJS from "exceljs"
import { PDFDocument, PageSizes, StandardFonts, rgb } from "pdf-lib"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { formatCOP } from "@/lib/utils"

export const reportKindSchema = z.enum(["sales", "orders", "customers"])
export const reportPresetSchema = z.enum([
  "today",
  "last7",
  "last30",
  "thisMonth",
  "custom",
])
export const reportFormatSchema = z.enum(["xlsx", "pdf"])

export const reportFiltersSchema = z
  .object({
    kind: reportKindSchema.default("sales"),
    preset: reportPresetSchema.default("last7"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    format: reportFormatSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.preset !== "custom") {
      return
    }

    if (!value.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Debes elegir una fecha inicial para el rango personalizado.",
      })
    }

    if (!value.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Debes elegir una fecha final para el rango personalizado.",
      })
    }
  })

export type ReportKind = z.infer<typeof reportKindSchema>
export type ReportPreset = z.infer<typeof reportPresetSchema>
export type ReportFormat = z.infer<typeof reportFormatSchema>
export type ReportFilters = z.infer<typeof reportFiltersSchema>

export const DEFAULT_REPORT_FILTERS: ReportFilters = {
  kind: "sales",
  preset: "last7",
  startDate: undefined,
  endDate: undefined,
}

type ReportMetric = {
  label: string
  value: string
  hint?: string
}

type ReportColumnFormat = "text" | "currency" | "date" | "datetime" | "number"

type ReportColumn = {
  key: string
  header: string
  format?: ReportColumnFormat
  width?: number
}

type ReportRowValue = string | number | Date | null
type ReportRow = Record<string, ReportRowValue>

export type ReportSummaryPayload = {
  kind: ReportKind
  title: string
  description: string
  rangeLabel: string
  metrics: ReportMetric[]
  rowCount: number
  previewColumns: string[]
  previewRows: string[][]
  notes: string[]
}

type ReportExportPayload = {
  kind: ReportKind
  title: string
  description: string
  rangeLabel: string
  generatedAt: Date
  metrics: ReportMetric[]
  notes: string[]
  columns: ReportColumn[]
  pdfColumns: ReportColumn[]
  rows: ReportRow[]
}

type ResolvedRange = {
  start: Date
  end: Date
  label: string
  fileToken: string
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatFileDate(date: Date) {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, "0"),
    `${date.getDate()}`.padStart(2, "0"),
  ].join("-")
}

function resolveReportRange(filters: ReportFilters): ResolvedRange {
  const now = new Date()
  const today = startOfDay(now)

  if (filters.preset === "today") {
    return {
      start: today,
      end: endOfDay(now),
      label: `Hoy (${formatDate(now)})`,
      fileToken: formatFileDate(now),
    }
  }

  if (filters.preset === "last7") {
    const start = startOfDay(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000))

    return {
      start,
      end: endOfDay(now),
      label: `${formatDate(start)} - ${formatDate(now)} (ultimos 7 dias)`,
      fileToken: `${formatFileDate(start)}_${formatFileDate(now)}`,
    }
  }

  if (filters.preset === "last30") {
    const start = startOfDay(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000))

    return {
      start,
      end: endOfDay(now),
      label: `${formatDate(start)} - ${formatDate(now)} (ultimos 30 dias)`,
      fileToken: `${formatFileDate(start)}_${formatFileDate(now)}`,
    }
  }

  if (filters.preset === "thisMonth") {
    const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))

    return {
      start,
      end: endOfDay(now),
      label: `${formatDate(start)} - ${formatDate(now)} (mes actual)`,
      fileToken: `${formatFileDate(start)}_${formatFileDate(now)}`,
    }
  }

  const customStart = filters.startDate ? parseDateOnly(filters.startDate) : null
  const customEnd = filters.endDate ? parseDateOnly(filters.endDate) : null

  if (!customStart || !customEnd) {
    throw new Error("El rango personalizado no es valido.")
  }

  if (customStart > customEnd) {
    throw new Error("La fecha inicial no puede ser mayor que la fecha final.")
  }

  return {
    start: startOfDay(customStart),
    end: endOfDay(customEnd),
    label: `${formatDate(customStart)} - ${formatDate(customEnd)}`,
    fileToken: `${formatFileDate(customStart)}_${formatFileDate(customEnd)}`,
  }
}

function getKindTitle(kind: ReportKind) {
  switch (kind) {
    case "sales":
      return "Reporte de ventas"
    case "orders":
      return "Reporte de pedidos"
    case "customers":
      return "Reporte de clientes"
  }
}

function formatReportValue(value: ReportRowValue, format?: ReportColumnFormat) {
  if (value === null || value === undefined) {
    return ""
  }

  if (format === "currency" && typeof value === "number") {
    return formatCOP(value)
  }

  if (format === "date" && value instanceof Date) {
    return formatDate(value)
  }

  if (format === "datetime" && value instanceof Date) {
    return formatDateTime(value)
  }

  return String(value)
}

function getPreviewColumns(columns: ReportColumn[]) {
  return columns.slice(0, 4)
}

function buildPreviewRows(columns: ReportColumn[], rows: ReportRow[]) {
  const previewColumns = getPreviewColumns(columns)

  return rows.slice(0, 5).map((row) =>
    previewColumns.map((column) =>
      formatReportValue(row[column.key] ?? null, column.format)
    )
  )
}

async function buildSalesReport(range: ResolvedRange): Promise<ReportExportPayload> {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: range.start,
        lte: range.end,
      },
      paymentStatus: "PAID",
    },
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      createdAt: true,
      shippingName: true,
      customerEmail: true,
      shippingCity: true,
      paymentMethod: true,
      status: true,
      shippingCarrier: true,
      trackingNumber: true,
      subtotal: true,
      discount: true,
      total: true,
      _count: {
        select: {
          items: true,
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  })

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalDiscount = orders.reduce((sum, order) => sum + order.discount, 0)
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0

  const columns: ReportColumn[] = [
    { key: "orderNumber", header: "Pedido", width: 18 },
    { key: "createdAt", header: "Fecha", format: "datetime", width: 20 },
    { key: "shippingName", header: "Cliente", width: 22 },
    { key: "customerEmail", header: "Email", width: 28 },
    { key: "shippingCity", header: "Ciudad", width: 18 },
    { key: "paymentMethod", header: "Pago", width: 16 },
    { key: "status", header: "Estado", width: 16 },
    { key: "shippingCarrier", header: "Transportadora", width: 20 },
    { key: "trackingNumber", header: "Guia", width: 18 },
    { key: "itemCount", header: "Items", format: "number", width: 12 },
    { key: "subtotal", header: "Subtotal", format: "currency", width: 16 },
    { key: "discount", header: "Descuento", format: "currency", width: 16 },
    { key: "total", header: "Total", format: "currency", width: 16 },
  ]

  const pdfColumns: ReportColumn[] = [
    { key: "orderNumber", header: "Pedido" },
    { key: "createdAt", header: "Fecha", format: "date" },
    { key: "shippingName", header: "Cliente" },
    { key: "paymentMethod", header: "Pago" },
    { key: "shippingCarrier", header: "Transportadora" },
    { key: "trackingNumber", header: "Guia" },
    { key: "discount", header: "Desc.", format: "currency" },
    { key: "total", header: "Total", format: "currency" },
  ]

  const rows: ReportRow[] = orders.map((order) => ({
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    shippingName: order.shippingName,
    customerEmail: order.customerEmail || order.user.email || "",
    shippingCity: order.shippingCity,
    paymentMethod: order.paymentMethod,
    status: order.status,
    shippingCarrier: order.shippingCarrier || "",
    trackingNumber: order.trackingNumber || "",
    itemCount: order._count.items,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
  }))

  return {
    kind: "sales",
    title: getKindTitle("sales"),
    description: "Ventas pagadas registradas en el rango seleccionado.",
    rangeLabel: range.label,
    generatedAt: new Date(),
    metrics: [
      { label: "Ingresos", value: formatCOP(totalRevenue) },
      { label: "Pedidos pagados", value: `${orders.length}` },
      { label: "Ticket promedio", value: formatCOP(avgTicket) },
      { label: "Descuentos", value: formatCOP(totalDiscount) },
    ],
    notes: [
      "Este reporte usa pedidos con estado de pago PAID dentro del rango seleccionado.",
      "Las cifras se calculan desde la base local del negocio, no desde el frontend.",
    ],
    columns,
    pdfColumns,
    rows,
  }
}

async function buildOrdersReport(range: ResolvedRange): Promise<ReportExportPayload> {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: range.start,
        lte: range.end,
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      orderNumber: true,
      createdAt: true,
      shippingName: true,
      customerEmail: true,
      paymentMethod: true,
      paymentStatus: true,
      status: true,
      shippingCarrier: true,
      trackingNumber: true,
      total: true,
      _count: {
        select: {
          items: true,
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  })

  const paidCount = orders.filter((order) => order.paymentStatus === "PAID").length
  const pendingCount = orders.filter((order) => order.status === "PENDING").length
  const shippedCount = orders.filter((order) => order.status === "SHIPPED").length
  const cancelledCount = orders.filter((order) => order.status === "CANCELLED").length

  const columns: ReportColumn[] = [
    { key: "orderNumber", header: "Pedido", width: 18 },
    { key: "createdAt", header: "Fecha", format: "datetime", width: 20 },
    { key: "shippingName", header: "Cliente", width: 22 },
    { key: "customerEmail", header: "Email", width: 28 },
    { key: "paymentMethod", header: "Metodo de pago", width: 18 },
    { key: "paymentStatus", header: "Estado de pago", width: 18 },
    { key: "status", header: "Estado de pedido", width: 18 },
    { key: "shippingCarrier", header: "Transportadora", width: 20 },
    { key: "trackingNumber", header: "Guia", width: 18 },
    { key: "itemCount", header: "Items", format: "number", width: 12 },
    { key: "total", header: "Total", format: "currency", width: 16 },
  ]

  const pdfColumns: ReportColumn[] = [
    { key: "orderNumber", header: "Pedido" },
    { key: "createdAt", header: "Fecha", format: "date" },
    { key: "shippingName", header: "Cliente" },
    { key: "paymentStatus", header: "Pago" },
    { key: "status", header: "Pedido" },
    { key: "trackingNumber", header: "Guia" },
    { key: "total", header: "Total", format: "currency" },
  ]

  const rows: ReportRow[] = orders.map((order) => ({
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    shippingName: order.shippingName,
    customerEmail: order.customerEmail || order.user.email || "",
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status: order.status,
    shippingCarrier: order.shippingCarrier || "",
    trackingNumber: order.trackingNumber || "",
    itemCount: order._count.items,
    total: order.total,
  }))

  return {
    kind: "orders",
    title: getKindTitle("orders"),
    description: "Pedidos creados en el rango, con sus estados operativos y de pago.",
    rangeLabel: range.label,
    generatedAt: new Date(),
    metrics: [
      { label: "Pedidos", value: `${orders.length}` },
      { label: "Pagados", value: `${paidCount}` },
      { label: "Pendientes", value: `${pendingCount}` },
      { label: "Enviados", value: `${shippedCount}` },
      { label: "Cancelados", value: `${cancelledCount}` },
    ],
    notes: [
      "El reporte incluye todos los pedidos creados en el rango, incluso si luego fueron cancelados.",
      "Puedes usar la guia y la transportadora para seguimiento o conciliacion operativa.",
    ],
    columns,
    pdfColumns,
    rows,
  }
}

async function buildCustomersReport(range: ResolvedRange): Promise<ReportExportPayload> {
  const ordersInRange = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: range.start,
        lte: range.end,
      },
      user: {
        role: "CUSTOMER",
      },
    },
    select: {
      userId: true,
      createdAt: true,
      total: true,
      paymentStatus: true,
    },
  })

  const activityMap = new Map<
    string,
    {
      ordersInRange: number
      paidOrdersInRange: number
      totalSpentInRange: number
      lastOrderAt: Date | null
    }
  >()

  for (const order of ordersInRange) {
    const current = activityMap.get(order.userId) ?? {
      ordersInRange: 0,
      paidOrdersInRange: 0,
      totalSpentInRange: 0,
      lastOrderAt: null,
    }

    current.ordersInRange += 1

    if (order.paymentStatus === "PAID") {
      current.paidOrdersInRange += 1
      current.totalSpentInRange += order.total
    }

    if (!current.lastOrderAt || current.lastOrderAt < order.createdAt) {
      current.lastOrderAt = order.createdAt
    }

    activityMap.set(order.userId, current)
  }

  const activeUserIds = [...activityMap.keys()]
  const userWhere =
    activeUserIds.length > 0
      ? {
          role: "CUSTOMER" as const,
          OR: [
            {
              createdAt: {
                gte: range.start,
                lte: range.end,
              },
            },
            {
              id: {
                in: activeUserIds,
              },
            },
          ],
        }
      : {
          role: "CUSTOMER" as const,
          createdAt: {
            gte: range.start,
            lte: range.end,
          },
        }

  const users = await prisma.user.findMany({
    where: userWhere,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      orders: {
        select: {
          total: true,
          paymentStatus: true,
          createdAt: true,
        },
      },
    },
  })

  const newCustomers = users.filter(
    (user) => user.createdAt >= range.start && user.createdAt <= range.end
  ).length
  const activeBuyers = users.filter((user) => activityMap.has(user.id)).length
  const repeatBuyers = users.filter(
    (user) => (activityMap.get(user.id)?.paidOrdersInRange ?? 0) > 1
  ).length
  const rangeRevenue = [...activityMap.values()].reduce(
    (sum, entry) => sum + entry.totalSpentInRange,
    0
  )

  const columns: ReportColumn[] = [
    { key: "name", header: "Cliente", width: 24 },
    { key: "email", header: "Email", width: 28 },
    { key: "createdAt", header: "Registro", format: "date", width: 18 },
    { key: "ordersInRange", header: "Pedidos en rango", format: "number", width: 18 },
    { key: "paidOrdersInRange", header: "Pagados en rango", format: "number", width: 18 },
    { key: "totalSpentInRange", header: "Venta en rango", format: "currency", width: 18 },
    { key: "lifetimeOrders", header: "Pedidos historicos", format: "number", width: 18 },
    { key: "lifetimeSpent", header: "Venta historica", format: "currency", width: 18 },
    { key: "lastOrderAt", header: "Ultimo pedido", format: "date", width: 18 },
  ]

  const pdfColumns: ReportColumn[] = [
    { key: "name", header: "Cliente" },
    { key: "email", header: "Email" },
    { key: "createdAt", header: "Registro", format: "date" },
    { key: "ordersInRange", header: "Pedidos", format: "number" },
    { key: "totalSpentInRange", header: "Venta", format: "currency" },
    { key: "lastOrderAt", header: "Ultimo pedido", format: "date" },
  ]

  const rows: ReportRow[] = users.map((user) => {
    const activity = activityMap.get(user.id)
    const paidOrders = user.orders.filter((order) => order.paymentStatus === "PAID")
    const lifetimeSpent = paidOrders.reduce((sum, order) => sum + order.total, 0)
    const lastOrderAt = user.orders.reduce<Date | null>((latest, order) => {
      if (!latest || latest < order.createdAt) {
        return order.createdAt
      }

      return latest
    }, null)

    return {
      name: user.name || "Cliente",
      email: user.email || "",
      createdAt: user.createdAt,
      ordersInRange: activity?.ordersInRange ?? 0,
      paidOrdersInRange: activity?.paidOrdersInRange ?? 0,
      totalSpentInRange: activity?.totalSpentInRange ?? 0,
      lifetimeOrders: user.orders.length,
      lifetimeSpent,
      lastOrderAt,
    }
  })

  rows.sort((left, right) => {
    const leftDate = left.lastOrderAt instanceof Date ? left.lastOrderAt.getTime() : 0
    const rightDate = right.lastOrderAt instanceof Date ? right.lastOrderAt.getTime() : 0

    return rightDate - leftDate
  })

  return {
    kind: "customers",
    title: getKindTitle("customers"),
    description: "Clientes registrados o con actividad de compra en el rango seleccionado.",
    rangeLabel: range.label,
    generatedAt: new Date(),
    metrics: [
      { label: "Clientes nuevos", value: `${newCustomers}` },
      { label: "Compradores activos", value: `${activeBuyers}` },
      { label: "Compradores recurrentes", value: `${repeatBuyers}` },
      { label: "Venta del rango", value: formatCOP(rangeRevenue) },
    ],
    notes: [
      "Incluye clientes creados en el rango y clientes con pedidos en ese mismo periodo.",
      "La venta historica se calcula solo sobre pedidos pagados del cliente.",
    ],
    columns,
    pdfColumns,
    rows,
  }
}

async function getReportPayload(filters: ReportFilters) {
  const range = resolveReportRange(filters)

  switch (filters.kind) {
    case "sales":
      return buildSalesReport(range)
    case "orders":
      return buildOrdersReport(range)
    case "customers":
      return buildCustomersReport(range)
  }
}

export async function getReportSummary(filters: ReportFilters): Promise<ReportSummaryPayload> {
  const report = await getReportPayload(filters)

  return {
    kind: report.kind,
    title: report.title,
    description: report.description,
    rangeLabel: report.rangeLabel,
    metrics: report.metrics,
    rowCount: report.rows.length,
    previewColumns: getPreviewColumns(report.columns).map((column) => column.header),
    previewRows: buildPreviewRows(report.columns, report.rows),
    notes: report.notes,
  }
}

function sanitizeFileToken(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
}

export async function buildReportFileName(filters: ReportFilters) {
  const range = resolveReportRange(filters)

  return `lilcake-${sanitizeFileToken(filters.kind)}-${range.fileToken}`
}

function applyExcelHeaderStyles(row: ExcelJS.Row) {
  row.height = 24
  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6C3CE1" },
    }
    cell.font = {
      bold: true,
      color: { argb: "FFFFFFFF" },
    }
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
    }
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF2A2A45" } },
    }
  })
}

function applySummaryCard(
  sheet: ExcelJS.Worksheet,
  startCol: "A" | "C",
  row: number,
  label: string,
  value: string
) {
  const endCol = startCol === "A" ? "B" : "D"

  for (let rowIndex = row; rowIndex <= row + 2; rowIndex += 1) {
    for (
      let colCode = startCol.charCodeAt(0);
      colCode <= endCol.charCodeAt(0);
      colCode += 1
    ) {
      const cell = sheet.getCell(`${String.fromCharCode(colCode)}${rowIndex}`)
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF7F4FF" },
      }
      cell.border = {
        top: { style: "thin", color: { argb: "FFD9D1F4" } },
        left: { style: "thin", color: { argb: "FFD9D1F4" } },
        bottom: { style: "thin", color: { argb: "FFD9D1F4" } },
        right: { style: "thin", color: { argb: "FFD9D1F4" } },
      }
      cell.alignment = {
        vertical: "middle",
        horizontal: "left",
      }
    }
  }

  sheet.getCell(`${startCol}${row}`).value = label
  sheet.getCell(`${startCol}${row}`).font = {
    size: 10,
    bold: true,
    color: { argb: "FF737798" },
  }

  sheet.getCell(`${startCol}${row + 1}`).value = value
  sheet.getCell(`${startCol}${row + 1}`).font = {
    size: 17,
    bold: true,
    color: { argb: "FF1A1833" },
  }
}

function excelNumberFormat(format?: ReportColumnFormat) {
  switch (format) {
    case "currency":
      return '"$"#,##0'
    case "date":
      return "dd/mm/yyyy"
    case "datetime":
      return "dd/mm/yyyy hh:mm"
    case "number":
      return "0"
    default:
      return undefined
  }
}

export async function exportReportAsWorkbook(filters: ReportFilters) {
  const report = await getReportPayload(filters)
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "LilCake"
  workbook.company = "LilCake"
  workbook.created = new Date()
  workbook.modified = new Date()
  workbook.subject = report.title

  const summarySheet = workbook.addWorksheet("Resumen", {
    views: [{ showGridLines: false }],
  })
  summarySheet.columns = [
    { width: 24 },
    { width: 24 },
    { width: 24 },
    { width: 24 },
  ]
  summarySheet.properties.defaultRowHeight = 22

  summarySheet.mergeCells("A1:D1")
  summarySheet.getCell("A1").value = "LilCake"
  summarySheet.getCell("A1").font = {
    size: 22,
    bold: true,
    color: { argb: "FFF5F5F7" },
  }
  summarySheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E1E35" },
  }
  summarySheet.getCell("A1").alignment = {
    vertical: "middle",
    horizontal: "left",
  }
  summarySheet.getCell("A1").border = {
    top: { style: "thin", color: { argb: "FF2A2A45" } },
    left: { style: "thin", color: { argb: "FF2A2A45" } },
    right: { style: "thin", color: { argb: "FF2A2A45" } },
  }
  summarySheet.getRow(1).height = 34

  summarySheet.mergeCells("A2:D2")
  summarySheet.getCell("A2").value = report.title
  summarySheet.getCell("A2").font = {
    size: 18,
    bold: true,
    color: { argb: "FFF5F5F7" },
  }
  summarySheet.getCell("A2").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E1E35" },
  }
  summarySheet.getCell("A2").border = {
    left: { style: "thin", color: { argb: "FF2A2A45" } },
    right: { style: "thin", color: { argb: "FF2A2A45" } },
  }

  summarySheet.mergeCells("A3:D3")
  summarySheet.getCell("A3").value = `${report.rangeLabel} | Generado ${formatDateTime(report.generatedAt)}`
  summarySheet.getCell("A3").font = {
    size: 10,
    color: { argb: "FFABABBE" },
  }
  summarySheet.getCell("A3").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E1E35" },
  }
  summarySheet.getCell("A3").border = {
    left: { style: "thin", color: { argb: "FF2A2A45" } },
    right: { style: "thin", color: { argb: "FF2A2A45" } },
    bottom: { style: "thin", color: { argb: "FF2A2A45" } },
  }

  summarySheet.mergeCells("A5:D5")
  summarySheet.getCell("A5").value = "Resumen ejecutivo"
  summarySheet.getCell("A5").font = {
    size: 11,
    bold: true,
    color: { argb: "FF6C3CE1" },
  }

  const metricRow = 6
  report.metrics.forEach((metric, index) => {
    const row = metricRow + Math.floor(index / 2) * 4
    const col = index % 2 === 0 ? "A" : "C"

    applySummaryCard(summarySheet, col, row, metric.label, metric.value)
  })

  const notesStartRow = metricRow + Math.ceil(report.metrics.length / 2) * 4 + 1
  summarySheet.mergeCells(`A${notesStartRow}:D${notesStartRow}`)
  summarySheet.getCell(`A${notesStartRow}`).value = "Notas"
  summarySheet.getCell(`A${notesStartRow}`).font = {
    bold: true,
    color: { argb: "FF6C3CE1" },
  }

  report.notes.forEach((note, index) => {
    const noteRow = notesStartRow + 1 + index
    summarySheet.mergeCells(`A${noteRow}:D${noteRow}`)
    summarySheet.getCell(`A${notesStartRow + 1 + index}`).value = `• ${note}`
    summarySheet.getCell(`A${notesStartRow + 1 + index}`).font = {
      color: { argb: "FFD5D7E1" },
    }
    summarySheet.getCell(`A${noteRow}`).value = `- ${note}`
    summarySheet.getCell(`A${noteRow}`).font = {
      color: { argb: "FF545774" },
    }
    summarySheet.getCell(`A${noteRow}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8F7FC" },
    }
    summarySheet.getCell(`A${noteRow}`).border = {
      top: { style: "thin", color: { argb: "FFE3DEF6" } },
      left: { style: "thin", color: { argb: "FFE3DEF6" } },
      bottom: { style: "thin", color: { argb: "FFE3DEF6" } },
      right: { style: "thin", color: { argb: "FFE3DEF6" } },
    }
  })

  const dataSheet = workbook.addWorksheet("Datos")
  dataSheet.columns = report.columns.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width ?? 18,
    style: excelNumberFormat(column.format)
      ? { numFmt: excelNumberFormat(column.format) }
      : undefined,
  }))

  applyExcelHeaderStyles(dataSheet.getRow(1))

  report.rows.forEach((row) => {
    dataSheet.addRow(row)
  })

  dataSheet.views = [{ state: "frozen", ySplit: 1 }]
  dataSheet.autoFilter = {
    from: "A1",
    to: String.fromCharCode(64 + report.columns.length) + "1",
  }

  dataSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return
    }

    row.eachCell((cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "left",
      }
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowNumber % 2 === 0 ? "FFF9F9FD" : "FFFFFFFF" },
      }
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE6E6F0" } },
      }
    })
  })

  return workbook.xlsx.writeBuffer()
}

function truncatePdfText(value: string, limit = 26) {
  if (value.length <= limit) {
    return value
  }

  return `${value.slice(0, Math.max(0, limit - 1))}…`
}

function getPdfColumnRatios(kind: ReportKind) {
  if (kind === "customers") {
    return [1.2, 1.8, 0.9, 0.8, 1.05, 1.05]
  }

  if (kind === "orders") {
    return [1.05, 0.85, 1.25, 0.8, 0.8, 1.0, 1.0]
  }

  return [1.0, 0.85, 1.2, 0.8, 1.0, 1.0, 0.85, 1.0]
}

function formatPdfValue(value: ReportRowValue, format?: ReportColumnFormat) {
  return truncatePdfText(formatReportValue(value, format), format === "currency" ? 18 : 26)
}

export async function exportReportAsPdf(filters: ReportFilters) {
  const report = await getReportPayload(filters)
  const pdfDoc = await PDFDocument.create()
  const [regularFont, boldFont] = await Promise.all([
    pdfDoc.embedFont(StandardFonts.Helvetica),
    pdfDoc.embedFont(StandardFonts.HelveticaBold),
  ])

  const [a4Width, a4Height] = PageSizes.A4
  const pageWidth = a4Height
  const pageHeight = a4Width
  const margin = 40

  const addPage = () => pdfDoc.addPage([pageWidth, pageHeight])

  const drawHeader = (page: import("pdf-lib").PDFPage, title: string, subtitle: string) => {
    page.drawRectangle({
      x: 0,
      y: pageHeight - 110,
      width: pageWidth,
      height: 110,
      color: rgb(0.08, 0.08, 0.16),
    })
    page.drawText("LilCake", {
      x: margin,
      y: pageHeight - 45,
      size: 24,
      font: boldFont,
      color: rgb(0.96, 0.96, 0.98),
    })
    page.drawText(title, {
      x: margin,
      y: pageHeight - 75,
      size: 18,
      font: boldFont,
      color: rgb(0.96, 0.96, 0.98),
    })
    page.drawText(subtitle, {
      x: margin,
      y: pageHeight - 95,
      size: 10,
      font: regularFont,
      color: rgb(0.78, 0.8, 0.9),
    })
  }

  const summaryPage = addPage()
  drawHeader(
    summaryPage,
    report.title,
    `${report.rangeLabel} | Generado ${formatDateTime(report.generatedAt)}`
  )

  summaryPage.drawText(report.description, {
    x: margin,
    y: pageHeight - 145,
    size: 11,
    font: regularFont,
    color: rgb(0.18, 0.19, 0.28),
  })

  report.metrics.forEach((metric, index) => {
    const cardWidth = (pageWidth - margin * 2 - 18) / 2
    const cardHeight = 62
    const gap = 18
    const col = index % 2
    const row = Math.floor(index / 2)
    const x = margin + col * (cardWidth + gap)
    const y = pageHeight - 200 - row * (cardHeight + 14)

    summaryPage.drawRectangle({
      x,
      y,
      width: cardWidth,
      height: cardHeight,
      color: rgb(0.95, 0.96, 0.99),
      borderColor: rgb(0.83, 0.84, 0.9),
      borderWidth: 1,
    })
    summaryPage.drawText(metric.label, {
      x: x + 14,
      y: y + 40,
      size: 9,
      font: boldFont,
      color: rgb(0.42, 0.24, 0.88),
    })
    summaryPage.drawText(metric.value, {
      x: x + 14,
      y: y + 18,
      size: 16,
      font: boldFont,
      color: rgb(0.12, 0.12, 0.2),
    })
  })

  let notesY = pageHeight - 360
  summaryPage.drawText("Notas del reporte", {
    x: margin,
    y: notesY,
    size: 12,
    font: boldFont,
    color: rgb(0.12, 0.12, 0.2),
  })
  notesY -= 20
  report.notes.forEach((note) => {
    summaryPage.drawText(`• ${truncatePdfText(note, 110)}`, {
      x: margin,
      y: notesY,
      size: 10,
      font: regularFont,
      color: rgb(0.22, 0.23, 0.33),
    })
    notesY -= 16
  })

  const columns = report.pdfColumns
  const ratios = getPdfColumnRatios(report.kind)
  const totalRatio = ratios.reduce((sum, ratio) => sum + ratio, 0)
  const availableWidth = pageWidth - margin * 2
  const columnWidths = ratios.map((ratio) => (ratio / totalRatio) * availableWidth)
  const headerHeight = 24
  const headerGap = 6
  const rowHeight = 18
  const rowsPerPage = 20

  for (let pageIndex = 0; pageIndex * rowsPerPage < report.rows.length; pageIndex += 1) {
    const page = addPage()
    drawHeader(
      page,
      `${report.title} - Datos`,
      `${report.rangeLabel} | Pagina ${pageIndex + 1}`
    )

    const tableTopY = pageHeight - 145
    let cursorY = tableTopY
    let cursorX = margin

    page.drawRectangle({
      x: margin,
      y: cursorY - headerHeight,
      width: availableWidth,
      height: headerHeight,
      color: rgb(0.42, 0.24, 0.88),
    })

    columns.forEach((column, columnIndex) => {
      page.drawText(column.header, {
        x: cursorX + 4,
        y: cursorY - 16,
        size: 8,
        font: boldFont,
        color: rgb(1, 1, 1),
      })
      cursorX += columnWidths[columnIndex]
    })

    cursorY -= headerHeight + headerGap
    const pageRows = report.rows.slice(
      pageIndex * rowsPerPage,
      pageIndex * rowsPerPage + rowsPerPage
    )

    pageRows.forEach((row, rowIndex) => {
      cursorX = margin

      page.drawRectangle({
        x: margin,
        y: cursorY - rowHeight,
        width: availableWidth,
        height: rowHeight,
        color: rowIndex % 2 === 0 ? rgb(0.97, 0.97, 0.99) : rgb(0.93, 0.94, 0.98),
      })

      columns.forEach((column, columnIndex) => {
        page.drawText(formatPdfValue(row[column.key] ?? null, column.format), {
          x: cursorX + 4,
          y: cursorY - 12,
          size: 7.5,
          font: regularFont,
          color: rgb(0.14, 0.15, 0.22),
        })
        cursorX += columnWidths[columnIndex]
      })

      cursorY -= rowHeight
    })
  }

  return Buffer.from(await pdfDoc.save())
}

export async function getSerializedReportSummary(filters: ReportFilters) {
  const summary = await getReportSummary(filters)

  return {
    ...summary,
  }
}
