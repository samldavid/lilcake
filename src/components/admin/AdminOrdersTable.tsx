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
  getPaymentMethodLabel,
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
  basePath?: string
}

export function AdminOrdersTable({
  orders,
  basePath = "/admin",
}: AdminOrdersTableProps) {
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
            getPaymentMethodLabel(order.paymentMethod),
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
    <div className="overflow-hidden rounded-2xl border border-lc-border bg-lc-card shadow-sm">
      <div className="space-y-3 border-b border-lc-border p-4 sm:p-5">
        <div className="max-w-xl">
          <AdminSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por pedido, cliente, correo, guia o transportadora..."
          />
        </div>
        <p className="text-xs text-lc-gray">
          {query.trim()
            ? `${filteredOrders.length} pedidos coinciden con tu busqueda`
            : `${orders.length} pedidos cargados`}
        </p>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="px-6 py-12 text-center text-lc-gray">
          {query.trim()
            ? `No encontramos pedidos que coincidan con "${query.trim()}".`
            : "Aun no hay pedidos en el sistema."}
        </div>
      ) : null}

      {filteredOrders.length > 0 ? (
        <div className="grid gap-4 p-4 md:hidden">
          {filteredOrders.map(({ order }) => (
            <article
              key={order.id}
              className="rounded-2xl border border-lc-border bg-lc-darker/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold text-lc-white">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-lc-gray">
                    {new Date(order.createdAt).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                  {getOrderStatusLabel(order.status)}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 text-sm">
                <div className="rounded-xl border border-lc-border bg-lc-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-lc-gray">
                    Cliente
                  </p>
                  <p className="mt-1 font-semibold text-lc-white">
                    {order.shippingName || order.user.name || "Cliente"}
                  </p>
                  <p className="mt-1 text-xs text-lc-gray">
                    {order.customerEmail || order.user.email}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-lc-border bg-lc-black/20 p-3">
                    <p className="text-xs uppercase tracking-wide text-lc-gray">
                      Pago
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getPaymentStatusClasses(order.paymentStatus)}`}
                    >
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                    <p className="mt-2 text-xs text-lc-gray uppercase">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-lc-border bg-lc-black/20 p-3">
                    <p className="text-xs uppercase tracking-wide text-lc-gray">
                      Total
                    </p>
                    <p className="mt-1 font-bold text-lc-white">
                      {formatCOP(order.total)}
                    </p>
                    <p className="mt-1 text-xs text-lc-gray">
                      {order._count.items} items
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-lc-border bg-lc-black/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-lc-gray">
                    Logistica
                  </p>
                  <p className="mt-1 text-sm text-lc-white">
                    {order.shippingCarrier || "Pendiente por asignar"}
                  </p>
                  <p className="mt-1 text-xs text-lc-gray">
                    {order.trackingNumber
                      ? `Guia ${order.trackingNumber}`
                      : "Sin numero de guia"}
                  </p>
                </div>
              </div>

              <Link
                href={`${basePath}/pedidos/${order.id}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-lc-purple/20 bg-lc-purple/10 px-4 py-2 text-sm font-semibold text-lc-purple transition-colors hover:bg-lc-purple/20"
              >
                <Eye size={16} />
                Ver detalles
              </Link>
            </article>
          ))}
        </div>
      ) : null}

      {filteredOrders.length > 0 ? (
        <div className="hidden overflow-x-auto custom-scrollbar md:block">
          <table className="w-full whitespace-nowrap text-left">
            <thead className="border-b border-lc-border bg-lc-darker">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Pedido / Fecha
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Cliente
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Pago
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Total
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lc-border">
              {filteredOrders.map(({ order }) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-lc-dark/40"
                >
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm font-bold text-lc-white">
                      {order.orderNumber}
                    </div>
                    <div className="mt-0.5 text-xs text-lc-gray">
                      {new Date(order.createdAt).toLocaleDateString("es-CO")}
                    </div>
                    {order.trackingNumber ? (
                      <div className="mt-1 text-xs text-lc-cyan">
                        {order.shippingCarrier
                          ? `${order.shippingCarrier} - Guia ${order.trackingNumber}`
                          : `Guia ${order.trackingNumber}`}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-lc-white">
                      {order.shippingName || order.user.name || "Cliente"}
                    </div>
                    <div className="mt-0.5 text-xs text-lc-gray">
                      {order.customerEmail || order.user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-1">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getPaymentStatusClasses(order.paymentStatus)}`}
                        >
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                        <span className="text-xs uppercase text-lc-gray">
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </span>
                      </div>
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
                    <div className="mt-0.5 text-xs text-lc-gray">
                      {order._count.items} items
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`${basePath}/pedidos/${order.id}`}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-lc-gray transition-colors hover:bg-lc-purple/10 hover:text-lc-purple"
                      title="Ver Detalles"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
