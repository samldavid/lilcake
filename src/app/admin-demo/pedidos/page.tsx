import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable"
import { adminDemoOrders } from "@/lib/admin-demo-data"

export default function AdminDemoOrdersPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-lc-white">Pedidos</h1>
        <p className="mt-1 text-sm text-lc-gray">
          Navega estados, pagos y seguimiento logistico en un entorno de demostracion.
        </p>
      </div>

      <AdminOrdersTable orders={adminDemoOrders} basePath="/admin-demo" />
    </div>
  )
}
