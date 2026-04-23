import { AdminCouponsManager } from "@/components/admin/AdminCouponsManager"
import {
  ADMIN_DEMO_NOTICE,
  adminDemoCoupons,
} from "@/lib/admin-demo-data"

export default function AdminDemoCouponsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-lc-white">
          Cupones de descuento
        </h1>
        <p className="mt-1 text-sm text-lc-gray">
          Prueba creacion, edicion y reglas promocionales sin tocar datos reales.
        </p>
      </div>

      <AdminCouponsManager
        initialCoupons={adminDemoCoupons}
        mode="demo"
        demoNotice={ADMIN_DEMO_NOTICE}
      />
    </div>
  )
}
