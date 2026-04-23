import type { AdminCouponRow } from "@/lib/admin-coupons"
import type { ReportFilters, ReportSummaryPayload } from "@/lib/business-reports"
import type { AdminCustomerRow } from "@/components/admin/AdminCustomersTable"
import type { AdminOrderRow } from "@/components/admin/AdminOrdersTable"
import type { AdminProductRow } from "@/components/admin/AdminProductsTable"
import type {
  ProductCategoryOption,
  ProductFormSeed,
} from "@/components/admin/ProductForm"
import { formatCOP } from "@/lib/utils"

export const ADMIN_DEMO_NOTICE =
  "Esto es una demo. Los cambios no se guardan."

export const adminDemoCategories: ProductCategoryOption[] = [
  { id: "cat-apparel", name: "Ropa" },
  { id: "cat-shoes", name: "Zapatos" },
  { id: "cat-accessories", name: "Accesorios" },
]

export const adminDemoProducts: AdminProductRow[] = [
  {
    id: "demo-retro-1999",
    name: "Camiseta FC Barcelona Retro 1999",
    price: 100000,
    compareAtPrice: 150000,
    isActive: true,
    category: { name: "Ropa" },
    variants: [{ stock: 14 }, { stock: 9 }],
    images: [{ url: "/images/retro1999.png" }],
  },
  {
    id: "demo-cap-drop",
    name: "Coleccion Gorras Volcom + Accesorios",
    price: 90000,
    compareAtPrice: 110000,
    isActive: true,
    category: { name: "Accesorios" },
    variants: [{ stock: 16 }],
    images: [{ url: "/images/accesorios.png" }],
  },
  {
    id: "demo-jordan-1",
    name: "Jordan 1 Mid Black White",
    price: 650000,
    compareAtPrice: null,
    isActive: true,
    category: { name: "Zapatos" },
    variants: [{ stock: 3 }, { stock: 5 }],
    images: [{ url: "/images/zapatos.png" }],
  },
  {
    id: "demo-sweater-ny",
    name: "Sweater Supreme New York",
    price: 320000,
    compareAtPrice: 350000,
    isActive: true,
    category: { name: "Ropa" },
    variants: [{ stock: 8 }, { stock: 8 }],
    images: [{ url: "/images/ropa.png" }],
  },
]

export const adminDemoProductSeeds: Record<string, ProductFormSeed> = {
  "demo-retro-1999": {
    id: "demo-retro-1999",
    name: "Camiseta FC Barcelona Retro 1999",
    description:
      "Pieza retro para colecciones urbanas, con enfoque visual fuerte y rotacion alta en catalogos de drops.",
    price: 100000,
    compareAtPrice: 150000,
    categoryId: "cat-apparel",
    isActive: true,
    isFeatured: true,
    images: [{ url: "/images/retro1999.png" }],
    variants: [
      {
        id: "demo-retro-1999-s",
        size: "S",
        color: "Azul/Rojo",
        sku: "RETRO-1999-S",
        stock: 14,
      },
      {
        id: "demo-retro-1999-m",
        size: "M",
        color: "Azul/Rojo",
        sku: "RETRO-1999-M",
        stock: 9,
      },
    ],
  },
  "demo-cap-drop": {
    id: "demo-cap-drop",
    name: "Coleccion Gorras Volcom + Accesorios",
    description:
      "Pack visual para temporadas capsule, ideal para mostrar bundling y ticket medio en la demo.",
    price: 90000,
    compareAtPrice: 110000,
    categoryId: "cat-accessories",
    isActive: true,
    isFeatured: false,
    images: [{ url: "/images/accesorios.png" }],
    variants: [
      {
        id: "demo-cap-drop-u",
        size: "Unitalla",
        color: "Varios",
        sku: "ACCESS-DROP-U",
        stock: 16,
      },
    ],
  },
  "demo-jordan-1": {
    id: "demo-jordan-1",
    name: "Jordan 1 Mid Black White",
    description:
      "Referencia premium para mostrar productos de mayor valor, variantes y control de stock.",
    price: 650000,
    compareAtPrice: null,
    categoryId: "cat-shoes",
    isActive: true,
    isFeatured: true,
    images: [{ url: "/images/zapatos.png" }],
    variants: [
      {
        id: "demo-jordan-1-8",
        size: "8 (US)",
        color: "Black/White",
        sku: "J1-BW-8",
        stock: 3,
      },
      {
        id: "demo-jordan-1-9",
        size: "9 (US)",
        color: "Black/White",
        sku: "J1-BW-9",
        stock: 5,
      },
    ],
  },
  "demo-sweater-ny": {
    id: "demo-sweater-ny",
    name: "Sweater Supreme New York",
    description:
      "Producto visual de alta conversion para demostrar merchandising, galerias y seguimiento de pedidos.",
    price: 320000,
    compareAtPrice: 350000,
    categoryId: "cat-apparel",
    isActive: true,
    isFeatured: true,
    images: [{ url: "/images/ropa.png" }],
    variants: [
      {
        id: "demo-sweater-ny-m",
        size: "M",
        color: "Beige",
        sku: "SW-NY-M",
        stock: 8,
      },
      {
        id: "demo-sweater-ny-l",
        size: "L",
        color: "Beige",
        sku: "SW-NY-L",
        stock: 8,
      },
    ],
  },
}

export const adminDemoCustomers: AdminCustomerRow[] = [
  {
    id: "demo-user-1",
    name: "Lucia Rojas",
    email: "lucia@demo.lilcake.co",
    phone: "3201002200",
    password: "demo-hash",
    createdAt: "2026-04-10T14:00:00.000Z",
    _count: { orders: 3 },
    accounts: [{ provider: "google" }],
  },
  {
    id: "demo-user-2",
    name: "Samuel Gomez Arcos",
    email: "samuel@demo.lilcake.co",
    phone: "3202003300",
    password: "demo-hash",
    createdAt: "2026-04-11T09:30:00.000Z",
    _count: { orders: 4 },
    accounts: [{ provider: "google" }],
  },
  {
    id: "demo-user-3",
    name: "David Gomez",
    email: "david@demo.lilcake.co",
    phone: "3203004400",
    password: "demo-hash",
    createdAt: "2026-04-12T11:15:00.000Z",
    _count: { orders: 2 },
    accounts: [],
  },
  {
    id: "demo-user-4",
    name: "Natalia Herrera",
    email: "natalia@demo.lilcake.co",
    phone: "3204005500",
    password: null,
    createdAt: "2026-04-14T17:45:00.000Z",
    _count: { orders: 1 },
    accounts: [{ provider: "google" }],
  },
]

export const adminDemoOrders: AdminOrderRow[] = [
  {
    id: "demo-order-1",
    orderNumber: "LC-DEMO-2401",
    createdAt: "2026-04-22T15:20:00.000Z",
    shippingName: "Samuel Gomez Arcos",
    customerEmail: "samuel@demo.lilcake.co",
    shippingCarrier: null,
    trackingNumber: null,
    paymentMethod: "STRIPE",
    paymentStatus: "PENDING",
    status: "PENDING",
    total: 410000,
    user: { name: "Samuel Gomez Arcos", email: "samuel@demo.lilcake.co" },
    _count: { items: 2 },
  },
  {
    id: "demo-order-2",
    orderNumber: "LC-DEMO-2402",
    createdAt: "2026-04-22T12:10:00.000Z",
    shippingName: "Lucia Rojas",
    customerEmail: "lucia@demo.lilcake.co",
    shippingCarrier: "Coordinadora",
    trackingNumber: "654684121654651",
    paymentMethod: "STRIPE",
    paymentStatus: "PAID",
    status: "SHIPPED",
    total: 320000,
    user: { name: "Lucia Rojas", email: "lucia@demo.lilcake.co" },
    _count: { items: 1 },
  },
  {
    id: "demo-order-3",
    orderNumber: "LC-DEMO-2403",
    createdAt: "2026-04-21T19:00:00.000Z",
    shippingName: "David Gomez",
    customerEmail: "david@demo.lilcake.co",
    shippingCarrier: "Interrapidisimo",
    trackingNumber: "1232112345",
    paymentMethod: "WHATSAPP",
    paymentStatus: "FAILED",
    status: "CANCELLED",
    total: 81000,
    user: { name: "David Gomez", email: "david@demo.lilcake.co" },
    _count: { items: 1 },
  },
  {
    id: "demo-order-4",
    orderNumber: "LC-DEMO-2404",
    createdAt: "2026-04-21T13:45:00.000Z",
    shippingName: "Natalia Herrera",
    customerEmail: "natalia@demo.lilcake.co",
    shippingCarrier: null,
    trackingNumber: null,
    paymentMethod: "STRIPE",
    paymentStatus: "PAID",
    status: "CONFIRMED",
    total: 90000,
    user: { name: "Natalia Herrera", email: "natalia@demo.lilcake.co" },
    _count: { items: 1 },
  },
  {
    id: "demo-order-5",
    orderNumber: "LC-DEMO-2405",
    createdAt: "2026-04-20T18:25:00.000Z",
    shippingName: "Lucia Rojas",
    customerEmail: "lucia@demo.lilcake.co",
    shippingCarrier: "Servientrega",
    trackingNumber: "9988776655",
    paymentMethod: "STRIPE",
    paymentStatus: "PAID",
    status: "DELIVERED",
    total: 650000,
    user: { name: "Lucia Rojas", email: "lucia@demo.lilcake.co" },
    _count: { items: 1 },
  },
]

export type AdminDemoOrderDetail = {
  id: string
  orderNumber: string
  status: string
  paymentStatus: string
  createdAt: Date
  subtotal: number
  discount: number
  total: number
  shippingName: string
  customerEmail: string | null
  shippingAddress: string
  shippingCity: string
  shippingPhone: string
  shippingCarrier: string | null
  paymentMethod: string
  trackingNumber: string | null
  confirmedAt: Date | null
  shippedAt: Date | null
  receiptEmailSentAt: Date | null
  confirmationEmailSentAt: Date | null
  shippingEmailSentAt: Date | null
  notes: string | null
  coupon: { code: string } | null
  user: { name: string | null; email: string | null }
  items: Array<{
    id: string
    productName: string
    productSize: string | null
    productColor: string | null
    quantity: number
    unitPrice: number
    variant: {
      product: {
        images: Array<{
          url: string
        }>
      }
    }
  }>
}

export const adminDemoOrderDetails: Record<string, AdminDemoOrderDetail> = {
  "demo-order-1": {
    id: "demo-order-1",
    orderNumber: "LC-DEMO-2401",
    status: "PENDING",
    paymentStatus: "PENDING",
    createdAt: new Date("2026-04-22T15:20:00.000Z"),
    subtotal: 420000,
    discount: 10000,
    total: 410000,
    shippingName: "Samuel Gomez Arcos",
    customerEmail: "samuel@demo.lilcake.co",
    shippingAddress: "Cra 10 # 45-20",
    shippingCity: "Bogota",
    shippingPhone: "3202003300",
    shippingCarrier: null,
    paymentMethod: "STRIPE",
    trackingNumber: null,
    confirmedAt: null,
    shippedAt: null,
    receiptEmailSentAt: new Date("2026-04-22T15:22:00.000Z"),
    confirmationEmailSentAt: null,
    shippingEmailSentAt: null,
    notes: "Cliente en demo revisando checkout y cupones.",
    coupon: { code: "BIENVENIDA10" },
    user: { name: "Samuel Gomez Arcos", email: "samuel@demo.lilcake.co" },
    items: [
      {
        id: "demo-order-1-item-1",
        productName: "Sweater Supreme New York",
        productSize: "M",
        productColor: "Beige",
        quantity: 1,
        unitPrice: 320000,
        variant: {
          product: {
            images: [{ url: "/images/ropa.png" }],
          },
        },
      },
      {
        id: "demo-order-1-item-2",
        productName: "Coleccion Gorras Volcom + Accesorios",
        productSize: "Unitalla",
        productColor: "Varios",
        quantity: 1,
        unitPrice: 100000,
        variant: {
          product: {
            images: [{ url: "/images/accesorios.png" }],
          },
        },
      },
    ],
  },
  "demo-order-2": {
    id: "demo-order-2",
    orderNumber: "LC-DEMO-2402",
    status: "SHIPPED",
    paymentStatus: "PAID",
    createdAt: new Date("2026-04-22T12:10:00.000Z"),
    subtotal: 320000,
    discount: 0,
    total: 320000,
    shippingName: "Lucia Rojas",
    customerEmail: "lucia@demo.lilcake.co",
    shippingAddress: "Calle 98 # 18-50",
    shippingCity: "Medellin",
    shippingPhone: "3201002200",
    shippingCarrier: "Coordinadora",
    paymentMethod: "STRIPE",
    trackingNumber: "654684121654651",
    confirmedAt: new Date("2026-04-22T12:16:00.000Z"),
    shippedAt: new Date("2026-04-22T16:35:00.000Z"),
    receiptEmailSentAt: new Date("2026-04-22T12:12:00.000Z"),
    confirmationEmailSentAt: new Date("2026-04-22T12:17:00.000Z"),
    shippingEmailSentAt: new Date("2026-04-22T16:40:00.000Z"),
    notes: "Pedido demo usado para mostrar tracking y notificaciones.",
    coupon: null,
    user: { name: "Lucia Rojas", email: "lucia@demo.lilcake.co" },
    items: [
      {
        id: "demo-order-2-item-1",
        productName: "Sweater Supreme New York",
        productSize: "L",
        productColor: "Beige",
        quantity: 1,
        unitPrice: 320000,
        variant: {
          product: {
            images: [{ url: "/images/ropa.png" }],
          },
        },
      },
    ],
  },
  "demo-order-3": {
    id: "demo-order-3",
    orderNumber: "LC-DEMO-2403",
    status: "CANCELLED",
    paymentStatus: "FAILED",
    createdAt: new Date("2026-04-21T19:00:00.000Z"),
    subtotal: 81000,
    discount: 0,
    total: 81000,
    shippingName: "David Gomez",
    customerEmail: "david@demo.lilcake.co",
    shippingAddress: "Av 12 # 30-88",
    shippingCity: "Cali",
    shippingPhone: "3203004400",
    shippingCarrier: "Interrapidisimo",
    paymentMethod: "WHATSAPP",
    trackingNumber: "1232112345",
    confirmedAt: null,
    shippedAt: null,
    receiptEmailSentAt: new Date("2026-04-21T19:02:00.000Z"),
    confirmationEmailSentAt: null,
    shippingEmailSentAt: null,
    notes: "Caso demo de cancelacion y pago fallido.",
    coupon: null,
    user: { name: "David Gomez", email: "david@demo.lilcake.co" },
    items: [
      {
        id: "demo-order-3-item-1",
        productName: "Coleccion Gorras Volcom + Accesorios",
        productSize: "Unitalla",
        productColor: "Varios",
        quantity: 1,
        unitPrice: 81000,
        variant: {
          product: {
            images: [{ url: "/images/accesorios.png" }],
          },
        },
      },
    ],
  },
  "demo-order-4": {
    id: "demo-order-4",
    orderNumber: "LC-DEMO-2404",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    createdAt: new Date("2026-04-21T13:45:00.000Z"),
    subtotal: 90000,
    discount: 0,
    total: 90000,
    shippingName: "Natalia Herrera",
    customerEmail: "natalia@demo.lilcake.co",
    shippingAddress: "Cra 44 # 76-14",
    shippingCity: "Barranquilla",
    shippingPhone: "3204005500",
    shippingCarrier: null,
    paymentMethod: "STRIPE",
    trackingNumber: null,
    confirmedAt: new Date("2026-04-21T13:50:00.000Z"),
    shippedAt: null,
    receiptEmailSentAt: new Date("2026-04-21T13:46:00.000Z"),
    confirmationEmailSentAt: new Date("2026-04-21T13:51:00.000Z"),
    shippingEmailSentAt: null,
    notes: "Preparado para mostrar un pedido confirmado antes de despacho.",
    coupon: null,
    user: { name: "Natalia Herrera", email: "natalia@demo.lilcake.co" },
    items: [
      {
        id: "demo-order-4-item-1",
        productName: "Coleccion Gorras Volcom + Accesorios",
        productSize: "Unitalla",
        productColor: "Varios",
        quantity: 1,
        unitPrice: 90000,
        variant: {
          product: {
            images: [{ url: "/images/accesorios.png" }],
          },
        },
      },
    ],
  },
  "demo-order-5": {
    id: "demo-order-5",
    orderNumber: "LC-DEMO-2405",
    status: "DELIVERED",
    paymentStatus: "PAID",
    createdAt: new Date("2026-04-20T18:25:00.000Z"),
    subtotal: 650000,
    discount: 0,
    total: 650000,
    shippingName: "Lucia Rojas",
    customerEmail: "lucia@demo.lilcake.co",
    shippingAddress: "Calle 10 # 22-05",
    shippingCity: "Manizales",
    shippingPhone: "3201002200",
    shippingCarrier: "Servientrega",
    paymentMethod: "STRIPE",
    trackingNumber: "9988776655",
    confirmedAt: new Date("2026-04-20T18:31:00.000Z"),
    shippedAt: new Date("2026-04-21T09:00:00.000Z"),
    receiptEmailSentAt: new Date("2026-04-20T18:27:00.000Z"),
    confirmationEmailSentAt: new Date("2026-04-20T18:32:00.000Z"),
    shippingEmailSentAt: new Date("2026-04-21T09:05:00.000Z"),
    notes: "Ejemplo de pedido entregado para mostrar ciclo completo.",
    coupon: null,
    user: { name: "Lucia Rojas", email: "lucia@demo.lilcake.co" },
    items: [
      {
        id: "demo-order-5-item-1",
        productName: "Jordan 1 Mid Black White",
        productSize: "9 (US)",
        productColor: "Black/White",
        quantity: 1,
        unitPrice: 650000,
        variant: {
          product: {
            images: [{ url: "/images/zapatos.png" }],
          },
        },
      },
    ],
  },
}

export const adminDemoCoupons: AdminCouponRow[] = [
  {
    id: "demo-coupon-1",
    code: "BIENVENIDA10",
    type: "PERCENTAGE",
    value: 10,
    minPurchase: 100000,
    maxUses: 100,
    maxUsesPerUser: 1,
    usedCount: 12,
    isActive: true,
    expiresAt: "2026-05-10T23:59:00.000Z",
    createdAt: "2026-04-15T10:00:00.000Z",
    totalOrders: 12,
    paidOrders: 9,
    pendingOrders: 2,
    cancelledOrders: 1,
    paidRevenue: 4820000,
  },
  {
    id: "demo-coupon-2",
    code: "DROP20",
    type: "PERCENTAGE",
    value: 20,
    minPurchase: 250000,
    maxUses: 50,
    maxUsesPerUser: 2,
    usedCount: 18,
    isActive: true,
    expiresAt: "2026-04-30T23:59:00.000Z",
    createdAt: "2026-04-16T15:00:00.000Z",
    totalOrders: 18,
    paidOrders: 14,
    pendingOrders: 3,
    cancelledOrders: 1,
    paidRevenue: 7640000,
  },
  {
    id: "demo-coupon-3",
    code: "VIP50000",
    type: "FIXED",
    value: 50000,
    minPurchase: 350000,
    maxUses: 10,
    maxUsesPerUser: 1,
    usedCount: 10,
    isActive: false,
    expiresAt: "2026-04-18T23:59:00.000Z",
    createdAt: "2026-04-10T08:00:00.000Z",
    totalOrders: 10,
    paidOrders: 10,
    pendingOrders: 0,
    cancelledOrders: 0,
    paidRevenue: 5320000,
  },
]

export const adminDemoDashboardStats = {
  totalSales: adminDemoOrders
    .filter((order) => order.paymentStatus === "PAID")
    .reduce((acc, order) => acc + order.total, 0),
  ordersCount: adminDemoOrders.length,
  usersCount: adminDemoCustomers.length,
  productsCount: adminDemoProducts.length,
}

function resolveDemoRangeLabel(filters: ReportFilters) {
  if (filters.preset === "today") {
    return "Hoy (demo)"
  }

  if (filters.preset === "last7") {
    return "Ultimos 7 dias (demo)"
  }

  if (filters.preset === "last30") {
    return "Ultimos 30 dias (demo)"
  }

  if (filters.preset === "thisMonth") {
    return "Mes actual (demo)"
  }

  if (filters.startDate && filters.endDate) {
    return `${filters.startDate} - ${filters.endDate} (demo)`
  }

  return "Rango personalizado (demo)"
}

export function getAdminDemoProduct(productId: string) {
  return adminDemoProductSeeds[productId] ?? null
}

export function getAdminDemoOrderDetail(orderId: string) {
  return adminDemoOrderDetails[orderId] ?? null
}

export function getAdminDemoReportSummary(
  filters: ReportFilters
): ReportSummaryPayload {
  const rangeLabel = resolveDemoRangeLabel(filters)

  if (filters.kind === "orders") {
    return {
      kind: "orders",
      title: "Reporte de pedidos (demo)",
      description:
        "Vista de ejemplo para mostrar seguimiento, pagos y estados operativos.",
      rangeLabel,
      metrics: [
        { label: "Pedidos", value: `${adminDemoOrders.length}` },
        {
          label: "Pagados",
          value: `${adminDemoOrders.filter((order) => order.paymentStatus === "PAID").length}`,
        },
        {
          label: "Enviados",
          value: `${adminDemoOrders.filter((order) => order.status === "SHIPPED").length}`,
        },
        {
          label: "Ticket medio",
          value: formatCOP(
            Math.round(
              adminDemoOrders.reduce((acc, order) => acc + order.total, 0) /
                adminDemoOrders.length
            )
          ),
        },
      ],
      rowCount: adminDemoOrders.length,
      previewColumns: ["Pedido", "Cliente", "Estado", "Pago", "Total"],
      previewRows: adminDemoOrders.slice(0, 4).map((order) => [
        order.orderNumber,
        order.shippingName || order.user.name || "Cliente",
        order.status,
        order.paymentStatus,
        formatCOP(order.total),
      ]),
      notes: [
        "Los reportes del demo usan datos de muestra y no afectan operaciones reales.",
        "Puedes cambiar filtros y exportar para explorar la experiencia administrativa.",
      ],
    }
  }

  if (filters.kind === "customers") {
    return {
      kind: "customers",
      title: "Reporte de clientes (demo)",
      description:
        "Resumen comercial para mostrar actividad, recurrencia y canales de acceso.",
      rangeLabel,
      metrics: [
        { label: "Clientes", value: `${adminDemoCustomers.length}` },
        {
          label: "Con Google",
          value: `${adminDemoCustomers.filter((user) => user.accounts.length > 0).length}`,
        },
        {
          label: "Con pedidos",
          value: `${adminDemoCustomers.filter((user) => user._count.orders > 0).length}`,
        },
        {
          label: "Pedidos promedio",
          value: `${(
            adminDemoCustomers.reduce((acc, user) => acc + user._count.orders, 0) /
            adminDemoCustomers.length
          ).toFixed(1)}`,
        },
      ],
      rowCount: adminDemoCustomers.length,
      previewColumns: ["Cliente", "Email", "Telefono", "Pedidos", "Acceso"],
      previewRows: adminDemoCustomers.slice(0, 4).map((user) => [
        user.name || "Cliente",
        user.email || "Sin email",
        user.phone || "Sin telefono",
        `${user._count.orders}`,
        user.accounts.length > 0 ? "Google / Correo" : "Correo",
      ]),
      notes: [
        "Ideal para demostrar segmentacion basica y seguimiento de clientes.",
        "El modo demo no genera archivos ni modifica registros reales.",
      ],
    }
  }

  const paidOrders = adminDemoOrders.filter((order) => order.paymentStatus === "PAID")
  const paidRevenue = paidOrders.reduce((acc, order) => acc + order.total, 0)

  return {
    kind: "sales",
    title: "Reporte de ventas (demo)",
    description:
      "Vista comercial de ejemplo para mostrar ingresos, volumen y descuentos.",
    rangeLabel,
    metrics: [
      { label: "Ingresos", value: formatCOP(paidRevenue) },
      { label: "Pedidos pagados", value: `${paidOrders.length}` },
      {
        label: "Ticket promedio",
        value: formatCOP(Math.round(paidRevenue / Math.max(paidOrders.length, 1))),
      },
      {
        label: "Descuentos",
        value: formatCOP(adminDemoCoupons.reduce((acc, coupon) => acc + coupon.value, 0)),
      },
    ],
    rowCount: paidOrders.length,
    previewColumns: ["Pedido", "Cliente", "Metodo", "Descuento", "Total"],
    previewRows: paidOrders.slice(0, 4).map((order) => [
      order.orderNumber,
      order.shippingName || order.user.name || "Cliente",
      order.paymentMethod,
      order.id === "demo-order-1" ? formatCOP(10000) : formatCOP(0),
      formatCOP(order.total),
    ]),
    notes: [
      "Los datos del demo son de ejemplo y existen solo para mostrar la experiencia.",
      "La version real exporta informacion desde PostgreSQL con validacion backend.",
    ],
  }
}
