import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Package } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatCOP } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import { AdminOrderStatusForm } from "@/components/orders/AdminOrderStatusForm"
import {
  getOrderStatusBadgeVariant,
  getOrderStatusLabel,
  getPaymentStatusClasses,
  getPaymentStatusLabel,
} from "@/lib/order-status"

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
  shippingAddress: string
  shippingCity: string
  shippingPhone: string
  paymentMethod: string
  trackingNumber: string | null
  notes: string | null
  coupon: {
    code: string
  } | null
  user: {
    name: string | null
    email: string | null
  }
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
      shippingAddress: true,
      shippingCity: true,
      shippingPhone: true,
      paymentMethod: true,
      trackingNumber: true,
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
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-2 text-sm text-lc-gray hover:text-lc-white transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al listado
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant={getOrderStatusBadgeVariant(order.status)}>
            {getOrderStatusLabel(order.status)}
          </Badge>
          <span
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${getPaymentStatusClasses(order.paymentStatus)}`}
          >
            Pago {getPaymentStatusLabel(order.paymentStatus)}
          </span>
        </div>
      </div>

      <section className="bg-lc-card rounded-2xl border border-lc-border p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-sm text-lc-purple font-bold tracking-widest mb-2">
              {order.orderNumber}
            </p>
            <h1 className="text-3xl font-heading font-bold text-lc-white mb-2">
              Detalle del pedido
            </h1>
            <p className="text-lc-gray">
              Creado el {order.createdAt.toLocaleDateString("es-CO")}
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-sm text-lc-gray mb-1">Cliente</p>
            <p className="text-lg font-bold text-lc-white">
              {order.shippingName || order.user.name || "Cliente"}
            </p>
            <p className="text-sm text-lc-gray">{order.user.email}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-lc-card rounded-2xl border border-lc-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="text-lc-purple" />
              <h2 className="text-xl font-heading font-bold text-lc-white">
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
                    className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-lc-border bg-lc-darker/60 p-4"
                  >
                    <div className="w-full sm:w-24 h-28 bg-lc-black rounded-xl overflow-hidden shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-lc-gray">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
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
                      <div className="flex items-center gap-4 text-sm text-lc-gray">
                        <span>Cantidad: {item.quantity}</span>
                        <span>Unitario: {formatCOP(item.unitPrice)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-lc-card rounded-2xl border border-lc-border p-6">
            <h2 className="text-xl font-heading font-bold text-lc-white mb-4">
              Resumen
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-lc-gray mb-1">Subtotal</p>
                <p className="text-lg font-bold text-lc-white">
                  {formatCOP(order.subtotal)}
                </p>
              </div>
              {order.discount > 0 ? (
                <div>
                  <p className="text-lc-gray mb-1">Descuento</p>
                  <p className="text-lg font-bold text-lc-success">
                    - {formatCOP(order.discount)}
                  </p>
                  {order.coupon ? (
                    <p className="text-xs text-lc-gray mt-1">
                      Cupon aplicado: {order.coupon.code}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div>
                <p className="text-lc-gray mb-1">Total</p>
                <p className="text-2xl font-heading font-bold text-lc-white">
                  {formatCOP(order.total)}
                </p>
              </div>
              <div>
                <p className="text-lc-gray mb-1">Direccion de envio</p>
                <p className="text-lc-white">{order.shippingAddress}</p>
                <p className="text-lc-gray">{order.shippingCity}</p>
              </div>
              <div>
                <p className="text-lc-gray mb-1">Telefono</p>
                <p className="text-lc-white">{order.shippingPhone}</p>
              </div>
              <div>
                <p className="text-lc-gray mb-1">Metodo de pago</p>
                <p className="text-lc-white">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="bg-lc-card rounded-2xl border border-lc-border p-6">
            <h2 className="text-xl font-heading font-bold text-lc-white mb-4">
              Actualizar pedido
            </h2>
            <AdminOrderStatusForm
              orderId={order.id}
              status={order.status}
              paymentStatus={order.paymentStatus}
              trackingNumber={order.trackingNumber}
              notes={order.notes}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
