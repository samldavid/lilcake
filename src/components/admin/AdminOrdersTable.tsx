"use client"

import * as React from "react"
import Link from "next/link"
import { useDeferredValue } from "react"
import { Eye } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { AdminSearchInput } from "@/components/admin/AdminSearchInput"
import { scoreAdminSearchMatch } from "@/lib/admin-search"
import { formatCOP } from "@/lib/utils"
import {
  getOrderStatusBadgeVariant,
  getOrderStatusLabel,
  getPaymentStatusClasses,
  getPaymentStatusLabel,
} from "@/lib/order-status"

export type AdminOrderRow = {
  id: string
  orderNumber: string
  createdAt: string
  shippingName: string | null
  customerEmail: string | null
  shippingCarrier: string | null
  trackingNumber: string | null
  paymentMethod: string
  paymentStatus: string
  status: string
  total: number
  user: {
    name: string | null
    email: string | null
  }
  _count: {
    items: number
  }
}

type AdminOrdersTableProps = {
  orders: AdminOrderRow[]
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const [query, setQuery] = React.useState("")
  const deferredQuery = useDeferredValue(query)
  const activeQuery = deferredQuery.trim()

  const filteredOrders = activeQuery
    ? orders
        .map((order) => {
          const score = scoreAdminSearchMatch(activeQuery, [
            order.orderNumber,
            order.shippingName,
            order.customerEmail,
            order.shippingCarrier,
            order.trackingNumber,
            order.user.name,
            order.user.email,
            order.paymentMethod,
            getPaymentStatusLabel(order.paymentStatus),
            getOrderStatusLabel(order.status),
          ])

          return {
            order,
            score,
          }
        })
        .filter((entry) => entry.score > 0)
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score
          }

          return right.order.createdAt.localeCompare(left.order.createdAt)
        })
    : orders.map((order) => ({
        order,
        score: 1,
      }))

  return (
    <div className="bg-lc-card rounded-2xl shadow-sm border border-lc-border overflow-hidden">
      <div className="p-4 border-b border-lc-border space-y-3">
        <div className="max-w-sm">
          <AdminSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por pedido, cliente, correo, guia o transportadora..."
          />
        </div>
        <p className="text-xs text-lc-gray">
          {query.trim()
            ? `${filteredOrders.length} pedidos coinciden con tu búsqueda`
            : `${orders.length} pedidos cargados`}
        </p>
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
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-lc-gray">
                  {query.trim()
                    ? `No encontramos pedidos que coincidan con "${query.trim()}".`
                    : "Aún no hay pedidos en el sistema."}
                </td>
              </tr>
            ) : (
              filteredOrders.map(({ order }) => (
                <tr key={order.id} className="hover:bg-lc-dark/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-lc-white font-mono text-sm">
                      {order.orderNumber}
                    </div>
                    <div className="text-xs text-lc-gray mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("es-CO")}
                    </div>
                    {order.trackingNumber ? (
                      <div className="text-xs text-lc-cyan mt-1">
                        {order.shippingCarrier
                          ? `${order.shippingCarrier} • Guia ${order.trackingNumber}`
                          : `Guia ${order.trackingNumber}`}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-lc-white text-sm">
                      {order.shippingName || order.user.name || "Cliente"}
                    </div>
                    <div className="text-xs text-lc-gray mt-0.5">
                      {order.customerEmail || order.user.email}
                    </div>
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
                      {order._count.items} items
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
  )
}
