import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Download, FileText, MailCheck, Package, Truck } from "lucide-react"
import { AdminOrderStatusForm } from "@/components/orders/AdminOrderStatusForm"
import { Badge } from "@/components/ui/Badge"
import { prisma } from "@/lib/prisma"
import {
  getOrderStatusBadgeVariant,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusBadgeLabel,
  getPaymentStatusClasses,
} from "@/lib/order-status"
import { formatCOP } from "@/lib/utils"

type AdminOrderItem = {
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
}

type AdminOrder = {
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
  coupon: {
    code: string
  } | null
  user: {
    name: string | null
    email: string | null
  }
  paymentTransactions: Array<{
    id: string
    provider: string
    providerReference: string
    providerTransactionId: string | null
    status: string
    rawStatus: string | null
    amountInCents: number
    currency: string
    paymentMethodType: string | null
    createdAt: Date
    updatedAt: Date
  }>
  items: AdminOrderItem[]
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order: AdminOrder | null = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      subtotal: true,
      discount: true,
      total: true,
      shippingName: true,
      customerEmail: true,
      shippingAddress: true,
      shippingCity: true,
      shippingPhone: true,
      shippingCarrier: true,
      paymentMethod: true,
      trackingNumber: true,
      confirmedAt: true,
      shippedAt: true,
      receiptEmailSentAt: true,
      confirmationEmailSentAt: true,
      shippingEmailSentAt: true,
      notes: true,
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
      paymentTransactions: {
        select: {
          id: true,
          provider: true,
          providerReference: true,
          providerTransactionId: true,
          status: true,
          rawStatus: true,
          amountInCents: true,
          currency: true,
          paymentMethodType: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      items: {
        select: {
          id: true,
          productName: true,
          productSize: true,
          productColor: true,
          quantity: true,
          unitPrice: true,
          variant: {
            select: {
              product: {
                select: {
                  images: {
                    select: {
                      url: true,
                    },
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="animate-fade-in space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-2 text-sm text-lc-gray transition-colors hover:text-lc-white"
        >
          <ArrowLeft size={16} />
          Volver al listado
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={getOrderStatusBadgeVariant(order.status)}>
            {getOrderStatusLabel(order.status)}
          </Badge>
          <span
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${getPaymentStatusClasses(order.paymentStatus)}`}
          >
            {getPaymentStatusBadgeLabel(order.paymentStatus)}
          </span>
        </div>
      </div>

      <section className="rounded-2xl border border-lc-border bg-lc-card p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold tracking-widest text-lc-purple">
              {order.orderNumber}
            </p>
            <h1 className="mb-2 text-2xl font-heading font-bold text-lc-white sm:text-3xl">
              Detalle del pedido
            </h1>
            <p className="text-sm text-lc-gray sm:text-base">
              Creado el {order.createdAt.toLocaleDateString("es-CO")}
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="mb-1 text-sm text-lc-gray">Cliente</p>
            <p className="text-lg font-bold text-lc-white">
              {order.shippingName || order.user.name || "Cliente"}
            </p>
            <p className="text-sm text-lc-gray">
              {order.customerEmail || order.user.email}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3 xl:gap-8">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-2xl border border-lc-border bg-lc-card p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <Package className="text-lc-purple" />
              <h2 className="text-lg font-heading font-bold text-lc-white sm:text-xl">
                Productos del pedido
              </h2>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => {
                const imageUrl = item.variant.product.images[0]?.url || ""
                const variantLabel = [item.productSize, item.productColor]
                  .filter(Boolean)
                  .join(" - ")

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-lc-border bg-lc-darker/60 p-4 sm:flex-row"
                  >
                    <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-lc-black sm:w-24">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-lc-gray">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-bold text-lc-white">{item.productName}</p>
                          <p className="text-sm text-lc-gray">
                            {variantLabel || "Variante principal"}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-lc-white">
                          {formatCOP(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-lc-gray sm:flex-row sm:items-center sm:gap-4">
                        <span>Cantidad: {item.quantity}</span>
                        <span>Unitario: {formatCOP(item.unitPrice)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-lc-border bg-lc-card p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <Truck className="text-lc-cyan" />
              <h2 className="text-lg font-heading font-bold text-lc-white sm:text-xl">
                Seguimiento y envio
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="rounded-2xl border border-lc-border bg-lc-darker/50 p-4">
                <p className="mb-1 text-lc-gray">Transportadora</p>
                <p className="font-medium text-lc-white">
                  {order.shippingCarrier || "Pendiente por asignar"}
                </p>
              </div>
              <div className="rounded-2xl border border-lc-border bg-lc-darker/50 p-4">
                <p className="mb-1 text-lc-gray">Numero de guia</p>
                <p className="font-medium text-lc-white">
                  {order.trackingNumber || "Aun no disponible"}
                </p>
              </div>
              <div className="rounded-2xl border border-lc-border bg-lc-darker/50 p-4">
                <p className="mb-1 text-lc-gray">Pedido confirmado</p>
                <p className="font-medium text-lc-white">
                  {order.confirmedAt
                    ? order.confirmedAt.toLocaleString("es-CO")
                    : "Pendiente"}
                </p>
              </div>
              <div className="rounded-2xl border border-lc-border bg-lc-darker/50 p-4">
                <p className="mb-1 text-lc-gray">Pedido enviado</p>
                <p className="font-medium text-lc-white">
                  {order.shippedAt
                    ? order.shippedAt.toLocaleString("es-CO")
                    : "Pendiente"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 text-sm lg:grid-cols-3">
              <div className="rounded-2xl border border-lc-border bg-lc-darker/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-lc-gray">
                  <MailCheck size={15} />
                  <span>Correo de pedido</span>
                </div>
                <p className="font-medium text-lc-white">
                  {order.receiptEmailSentAt
                    ? order.receiptEmailSentAt.toLocaleString("es-CO")
                    : "Sin registro"}
                </p>
              </div>
              <div className="rounded-2xl border border-lc-border bg-lc-darker/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-lc-gray">
                  <MailCheck size={15} />
                  <span>Correo de confirmacion</span>
                </div>
                <p className="font-medium text-lc-white">
                  {order.confirmationEmailSentAt
                    ? order.confirmationEmailSentAt.toLocaleString("es-CO")
                    : "Sin registro"}
                </p>
              </div>
              <div className="rounded-2xl border border-lc-border bg-lc-darker/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-lc-gray">
                  <MailCheck size={15} />
                  <span>Correo de envio</span>
                </div>
                <p className="font-medium text-lc-white">
                  {order.shippingEmailSentAt
                    ? order.shippingEmailSentAt.toLocaleString("es-CO")
                    : "Sin registro"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-lc-border bg-lc-card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-heading font-bold text-lc-white sm:text-xl">
              Resumen
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-1 text-lc-gray">Subtotal</p>
                <p className="text-lg font-bold text-lc-white">
                  {formatCOP(order.subtotal)}
                </p>
              </div>
              {order.discount > 0 ? (
                <div>
                  <p className="mb-1 text-lc-gray">Descuento</p>
                  <p className="text-lg font-bold text-lc-success">
                    - {formatCOP(order.discount)}
                  </p>
                  {order.coupon ? (
                    <p className="mt-1 text-xs text-lc-gray">
                      Cupon aplicado: {order.coupon.code}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div>
                <p className="mb-1 text-lc-gray">Total</p>
                <p className="text-2xl font-heading font-bold text-lc-white">
                  {formatCOP(order.total)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-lc-gray">Direccion de envio</p>
                <p className="text-lc-white">{order.shippingAddress}</p>
                <p className="text-lc-gray">{order.shippingCity}</p>
              </div>
              <div>
                <p className="mb-1 text-lc-gray">Email del cliente</p>
                <p className="text-lc-white">
                  {order.customerEmail || order.user.email || "Sin email"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-lc-gray">Telefono</p>
                <p className="text-lc-white">{order.shippingPhone}</p>
              </div>
              <div>
                <p className="mb-1 text-lc-gray">Transportadora</p>
                <p className="text-lc-white">
                  {order.shippingCarrier || "Pendiente"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-lc-gray">Numero de guia</p>
                <p className="text-lc-white">
                  {order.trackingNumber || "Pendiente"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-lc-gray">Metodo de pago</p>
                <p className="text-lc-white">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </p>
              </div>
            </div>
          </div>

          {order.paymentTransactions.length > 0 ? (
            <div className="rounded-2xl border border-lc-border bg-lc-card p-5 sm:p-6">
              <h2 className="mb-4 text-lg font-heading font-bold text-lc-white sm:text-xl">
                Transacciones de pago
              </h2>
              <div className="space-y-3">
                {order.paymentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-2xl border border-lc-border bg-lc-darker/60 p-4 text-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-lc-white">
                          {transaction.provider}
                          {transaction.paymentMethodType
                            ? ` / ${transaction.paymentMethodType}`
                            : ""}
                        </p>
                        <p className="mt-1 text-xs text-lc-gray">
                          Ref: {transaction.providerReference}
                        </p>
                        {transaction.providerTransactionId ? (
                          <p className="mt-1 text-xs text-lc-gray">
                            ID proveedor: {transaction.providerTransactionId}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-lc-white">
                          {formatCOP(transaction.amountInCents / 100)}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-lc-gray">
                          {transaction.rawStatus || transaction.status}
                        </p>
                        <p className="mt-1 text-xs text-lc-gray">
                          {transaction.createdAt.toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-lc-border bg-lc-card p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <FileText className="text-lc-purple" />
              <h2 className="text-lg font-heading font-bold text-lc-white sm:text-xl">
                Nota de venta
              </h2>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-lc-gray">
              Descarga el comprobante interno del pedido para soporte comercial.
              No reemplaza factura electronica ni documento equivalente DIAN.
            </p>
            <a
              href={`/api/admin/orders/${order.id}/sales-note`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-lc-purple/30 bg-lc-purple/10 px-4 py-3 text-sm font-bold text-lc-purple transition-colors hover:bg-lc-purple hover:text-white"
            >
              <Download size={16} />
              Descargar PDF
            </a>
          </div>

          <div className="rounded-2xl border border-lc-border bg-lc-card p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-heading font-bold text-lc-white sm:text-xl">
              Actualizar pedido
            </h2>
            <AdminOrderStatusForm
              orderId={order.id}
              status={order.status}
              paymentStatus={order.paymentStatus}
              shippingCarrier={order.shippingCarrier}
              trackingNumber={order.trackingNumber}
              notes={order.notes}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
