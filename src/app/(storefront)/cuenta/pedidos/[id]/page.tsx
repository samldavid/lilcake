import Link from "next/link"
import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, MessageCircle, Package, Truck } from "lucide-react"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCOP } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import { CustomerOrderActions } from "@/components/orders/CustomerOrderActions"
import {
  getOrderStatusBadgeVariant,
  getOrderStatusLabel,
  getPaymentStatusClasses,
  getPaymentStatusLabel,
} from "@/lib/order-status"

type CustomerOrderItem = {
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

type CustomerOrder = {
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
  customerEmail: string | null
  shippingAddress: string
  shippingCity: string
  shippingPhone: string
  shippingCarrier: string | null
  trackingNumber: string | null
  confirmedAt: Date | null
  shippedAt: Date | null
  notes: string | null
  coupon: {
    code: string
  } | null
  items: CustomerOrderItem[]
}

export default async function CustomerOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ canceled?: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/cuenta")
  }

  const { id } = await params
  const resolvedSearchParams = await searchParams
  const order: CustomerOrder | null = await prisma.order.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
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
      customerEmail: true,
      shippingAddress: true,
      shippingCity: true,
      shippingPhone: true,
      shippingCarrier: true,
      trackingNumber: true,
      confirmedAt: true,
      shippedAt: true,
      notes: true,
      coupon: {
        select: {
          code: true,
        },
      },
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { sortOrder: "asc" },
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/cuenta"
          className="inline-flex items-center gap-2 text-sm text-lc-gray hover:text-lc-white transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a mi cuenta
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

      <section className="bg-lc-dark border border-lc-border rounded-2xl p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-sm text-lc-purple font-bold tracking-widest mb-2">
              {order.orderNumber}
            </p>
            <h1 className="text-3xl font-heading font-bold text-lc-white mb-2">
              Detalle del pedido
            </h1>
            <p className="text-lc-gray">
              Creado el{" "}
              {order.createdAt.toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-sm text-lc-gray mb-1">Total del pedido</p>
            <p className="text-3xl font-heading font-bold text-lc-white">
              {formatCOP(order.total)}
            </p>
          </div>
        </div>

        {resolvedSearchParams.canceled === "true" && (
          <div className="mt-6 rounded-xl border border-lc-warning/30 bg-lc-warning/10 p-4 text-sm text-lc-warning">
            Cerraste la sesion de pago antes de completarla. Puedes retomarla desde aqui.
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-lc-dark border border-lc-border rounded-2xl p-6">
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

          <div className="bg-lc-dark border border-lc-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Truck className="text-lc-cyan" />
              <h2 className="text-xl font-heading font-bold text-lc-white">
                Seguimiento del envio
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-lc-border bg-lc-darker/60 p-4">
                <p className="text-lc-gray mb-1">Transportadora</p>
                <p className="text-lc-white font-medium">
                  {order.shippingCarrier || "Te la compartiremos cuando el pedido sea enviado"}
                </p>
              </div>
              <div className="rounded-2xl border border-lc-border bg-lc-darker/60 p-4">
                <p className="text-lc-gray mb-1">Numero de guia</p>
                <p className="text-lc-white font-medium">
                  {order.trackingNumber || "Aun no disponible"}
                </p>
              </div>
              <div className="rounded-2xl border border-lc-border bg-lc-darker/60 p-4">
                <p className="text-lc-gray mb-1">Pedido confirmado</p>
                <p className="text-lc-white font-medium">
                  {order.confirmedAt
                    ? order.confirmedAt.toLocaleString("es-CO")
                    : "Pendiente"}
                </p>
              </div>
              <div className="rounded-2xl border border-lc-border bg-lc-darker/60 p-4">
                <p className="text-lc-gray mb-1">Pedido enviado</p>
                <p className="text-lc-white font-medium">
                  {order.shippedAt
                    ? order.shippedAt.toLocaleString("es-CO")
                    : "Pendiente"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-lc-dark border border-lc-border rounded-2xl p-6">
            <h2 className="text-xl font-heading font-bold text-lc-white mb-4">
              Acciones del pedido
            </h2>
            <p className="text-sm text-lc-gray mb-4">
              Si tu pedido sigue pendiente, puedes retomarlo o cancelarlo desde aqui.
            </p>
            <CustomerOrderActions
              orderId={order.id}
              paymentMethod={order.paymentMethod}
              status={order.status}
              paymentStatus={order.paymentStatus}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-lc-dark border border-lc-border rounded-2xl p-6">
            <h2 className="text-xl font-heading font-bold text-lc-white mb-4">
              Envio y pago
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-lc-gray mb-1">Subtotal</p>
                <p className="text-lc-white font-medium">{formatCOP(order.subtotal)}</p>
              </div>
              {order.discount > 0 ? (
                <div>
                  <p className="text-lc-gray mb-1">Descuento</p>
                  <p className="text-lc-success font-medium">
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
                <p className="text-lc-white font-medium">{formatCOP(order.total)}</p>
              </div>
              <div>
                <p className="text-lc-gray mb-1">Recibe</p>
                <p className="text-lc-white font-medium">{order.shippingName}</p>
              </div>
              <div>
                <p className="text-lc-gray mb-1">Email</p>
                <p className="text-lc-white font-medium">
                  {order.customerEmail || session.user.email || "Sin email"}
                </p>
              </div>
              <div>
                <p className="text-lc-gray mb-1">Direccion</p>
                <p className="text-lc-white font-medium">{order.shippingAddress}</p>
                <p className="text-lc-gray">{order.shippingCity}</p>
              </div>
              <div>
                <p className="text-lc-gray mb-1">Telefono</p>
                <p className="text-lc-white font-medium">{order.shippingPhone}</p>
              </div>
              <div>
                <p className="text-lc-gray mb-1">Metodo de pago</p>
                <p className="text-lc-white font-medium">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-lc-gray mb-1">Transportadora</p>
                <p className="text-lc-white font-medium">
                  {order.shippingCarrier || "Pendiente"}
                </p>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-lc-gray mb-1">Numero de guia</p>
                  <p className="text-lc-white font-medium">{order.trackingNumber}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-lc-gray mb-1">Notas</p>
                  <p className="text-lc-white">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {order.paymentMethod === "WHATSAPP" && order.status === "PENDING" && (
            <div className="bg-lc-dark border border-lc-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="text-lc-success" />
                <h2 className="text-xl font-heading font-bold text-lc-white">
                  Continuar por WhatsApp
                </h2>
              </div>
              <p className="text-sm text-lc-gray">
                Abrimos el chat con el resumen del pedido para que puedas terminar la compra con el asesor.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
