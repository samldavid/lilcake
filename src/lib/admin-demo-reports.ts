import {
  adminDemoCustomers,
  adminDemoOrders,
  getAdminDemoReportSummary,
} from "@/lib/admin-demo-data"
import {
  buildReportFileName,
  exportReportPayloadAsPdf,
  exportReportPayloadAsWorkbook,
  type ReportColumn,
  type ReportExportPayload,
  type ReportFilters,
  type ReportKind,
  type ReportRow,
} from "@/lib/business-reports"

function normalizeRangeLabel(rangeLabel: string) {
  return rangeLabel.replace(/\s*\(demo\)\s*/gi, " ").replace(/\s+/g, " ").trim()
}

function buildSalesRows() {
  const paidOrders = adminDemoOrders.filter((order) => order.paymentStatus === "PAID")

  const columns: ReportColumn[] = [
    { key: "orderNumber", header: "Pedido", width: 18 },
    { key: "createdAt", header: "Fecha", format: "datetime", width: 20 },
    { key: "shippingName", header: "Cliente", width: 22 },
    { key: "customerEmail", header: "Email", width: 28 },
    { key: "paymentMethod", header: "Pago", width: 16 },
    { key: "status", header: "Estado", width: 16 },
    { key: "shippingCarrier", header: "Transportadora", width: 20 },
    { key: "trackingNumber", header: "Guia", width: 18 },
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

  const rows: ReportRow[] = paidOrders.map((order) => ({
    orderNumber: order.orderNumber,
    createdAt: new Date(order.createdAt),
    shippingName: order.shippingName || order.user.name || "Cliente",
    customerEmail: order.customerEmail || order.user.email || "",
    paymentMethod: order.paymentMethod,
    status: order.status,
    shippingCarrier: order.shippingCarrier || "",
    trackingNumber: order.trackingNumber || "",
    discount: order.orderNumber === "LC-DEMO-2401" ? 10000 : 0,
    total: order.total,
  }))

  return { columns, pdfColumns, rows }
}

function buildOrdersRows() {
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

  const rows: ReportRow[] = adminDemoOrders.map((order) => ({
    orderNumber: order.orderNumber,
    createdAt: new Date(order.createdAt),
    shippingName: order.shippingName || order.user.name || "Cliente",
    customerEmail: order.customerEmail || order.user.email || "",
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status: order.status,
    shippingCarrier: order.shippingCarrier || "",
    trackingNumber: order.trackingNumber || "",
    total: order.total,
  }))

  return { columns, pdfColumns, rows }
}

function buildCustomerRows() {
  const columns: ReportColumn[] = [
    { key: "name", header: "Cliente", width: 24 },
    { key: "email", header: "Email", width: 28 },
    { key: "phone", header: "Telefono", width: 18 },
    { key: "createdAt", header: "Registro", format: "date", width: 18 },
    { key: "access", header: "Acceso", width: 18 },
    { key: "orders", header: "Pedidos", format: "number", width: 14 },
    { key: "ordersStatus", header: "Estado comercial", width: 18 },
  ]

  const pdfColumns: ReportColumn[] = [
    { key: "name", header: "Cliente" },
    { key: "email", header: "Email" },
    { key: "createdAt", header: "Registro", format: "date" },
    { key: "orders", header: "Pedidos", format: "number" },
    { key: "access", header: "Acceso" },
    { key: "ordersStatus", header: "Perfil" },
  ]

  const rows: ReportRow[] = adminDemoCustomers.map((customer) => ({
    name: customer.name || "Cliente",
    email: customer.email || "Sin email",
    phone: customer.phone || "Sin telefono",
    createdAt: new Date(customer.createdAt),
    access:
      customer.accounts.length > 0 && customer.password
        ? "Google / Correo"
        : customer.accounts.length > 0
          ? "Google"
          : customer.password
            ? "Correo"
            : "Sin acceso",
    orders: customer._count.orders,
    ordersStatus: customer._count.orders > 2 ? "Recurrente" : "Nuevo / ocasional",
  }))

  return { columns, pdfColumns, rows }
}

function buildDemoExportPayload(filters: ReportFilters): ReportExportPayload {
  const summary = getAdminDemoReportSummary(filters)
  const kind: ReportKind = filters.kind

  if (kind === "orders") {
    const { columns, pdfColumns, rows } = buildOrdersRows()

    return {
      kind,
      title: summary.title,
      description: summary.description,
      rangeLabel: normalizeRangeLabel(summary.rangeLabel),
      generatedAt: new Date(),
      metrics: summary.metrics,
      notes: summary.notes,
      columns,
      pdfColumns,
      rows,
    }
  }

  if (kind === "customers") {
    const { columns, pdfColumns, rows } = buildCustomerRows()

    return {
      kind,
      title: summary.title,
      description: summary.description,
      rangeLabel: normalizeRangeLabel(summary.rangeLabel),
      generatedAt: new Date(),
      metrics: summary.metrics,
      notes: summary.notes,
      columns,
      pdfColumns,
      rows,
    }
  }

  const { columns, pdfColumns, rows } = buildSalesRows()

  return {
    kind,
    title: summary.title,
    description: summary.description,
    rangeLabel: normalizeRangeLabel(summary.rangeLabel),
    generatedAt: new Date(),
    metrics: summary.metrics,
    notes: summary.notes,
    columns,
    pdfColumns,
    rows,
  }
}

export async function buildAdminDemoReportFileName(filters: ReportFilters) {
  const baseName = await buildReportFileName(filters)
  return `${baseName}-demo`
}

export async function exportAdminDemoReportAsWorkbook(filters: ReportFilters) {
  return exportReportPayloadAsWorkbook(buildDemoExportPayload(filters))
}

export async function exportAdminDemoReportAsPdf(filters: ReportFilters) {
  return exportReportPayloadAsPdf(buildDemoExportPayload(filters))
}
