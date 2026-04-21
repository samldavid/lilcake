import { prisma } from "@/lib/prisma"
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      shippingName: true,
      customerEmail: true,
      shippingCarrier: true,
      trackingNumber: true,
      paymentMethod: true,
      paymentStatus: true,
      status: true,
      total: true,
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
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

      <AdminOrdersTable
        orders={orders.map((order) => ({
          ...order,
          createdAt: order.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
