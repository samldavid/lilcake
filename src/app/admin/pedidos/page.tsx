import Link from "next/link"
import { Eye, Search } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatCOP } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import {
  getOrderStatusBadgeVariant,
  getOrderStatusLabel,
  getPaymentStatusClasses,
  getPaymentStatusLabel,
} from "@/lib/order-status"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-lc-white">Pedidos</h1>
          <p className="text-lc-gray text-sm mt-1">
            Gestiona los pedidos de tus clientes y sus estados.
          </p>
        </div>
      </div>

      <div className="bg-lc-card rounded-2xl shadow-sm border border-lc-border overflow-hidden">
        <div className="p-4 border-b border-lc-border">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-lc-gray" />
            <input
              type="text"
              placeholder="Buscar por ID, cliente o correo..."
              className="w-full bg-lc-darker border border-lc-border rounded-xl pl-10 pr-4 py-2 text-sm text-lc-white focus:outline-none focus:border-lc-purple transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-lc-darker border-b border-lc-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider">
                  Pedido / Fecha
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-center">
                  Estado
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-right">
                  Total
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lc-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-lc-gray">
                    Aun no hay pedidos en el sistema.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-lc-dark/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-lc-white font-mono text-sm">
                        {order.orderNumber}
                      </div>
                      <div className="text-xs text-lc-gray mt-0.5">
                        {order.createdAt.toLocaleDateString("es-CO")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-lc-white text-sm">
                        {order.shippingName || order.user.name || "Cliente"}
                      </div>
                      <div className="text-xs text-lc-gray mt-0.5">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getPaymentStatusClasses(order.paymentStatus)}`}
                        >
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                        <span className="text-xs text-lc-gray uppercase">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-bold text-lc-white">
                        {formatCOP(order.total)}
                      </div>
                      <div className="text-xs text-lc-gray mt-0.5">
                        {order.items.length} items
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="inline-flex items-center justify-center text-lc-gray hover:text-lc-purple p-2 rounded-lg hover:bg-lc-purple/10 transition-colors"
                        title="Ver Detalles"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
