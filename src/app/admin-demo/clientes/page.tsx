import { AdminCustomersTable } from "@/components/admin/AdminCustomersTable"
import { adminDemoCustomers } from "@/lib/admin-demo-data"

export default function AdminDemoCustomersPage() {
  return (
    <div className="animate-fade-in space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-lc-white sm:text-3xl">
          Clientes
        </h1>
        <p className="mt-1 text-sm text-lc-gray">
          Directorio demo para mostrar segmentacion, accesos y actividad comercial.
        </p>
      </div>

      <AdminCustomersTable users={adminDemoCustomers} />
    </div>
  )
}
