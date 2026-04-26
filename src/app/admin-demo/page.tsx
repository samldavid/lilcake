import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react"
import { BusinessExportDemoPanel } from "@/components/admin/BusinessExportDemoPanel"
import { Card, CardBody } from "@/components/ui/Card"
import { adminDemoDashboardStats } from "@/lib/admin-demo-data"
import { formatCOP } from "@/lib/utils"

export default function AdminDemoDashboardPage() {
  return (
    <div className="animate-fade-in space-y-6 sm:space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-heading font-bold text-lc-white sm:text-3xl">
          Resumen General
        </h1>
        <p className="text-lc-gray-light">
          Vista sandbox del panel administrativo para mostrar el sistema a terceros.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        <Card glass>
          <CardBody className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="rounded-2xl border border-lc-success/20 bg-lc-success/10 p-4 text-lc-success">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-lc-gray">
                Ventas Demo
              </p>
              <p className="text-2xl font-bold text-lc-white">
                {formatCOP(adminDemoDashboardStats.totalSales)}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card glass>
          <CardBody className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="rounded-2xl border border-lc-cyan/20 bg-lc-cyan/10 p-4 text-lc-cyan">
              <ShoppingCart size={28} />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-lc-gray">
                Pedidos Simulados
              </p>
              <p className="text-2xl font-bold text-lc-white">
                {adminDemoDashboardStats.ordersCount}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card glass>
          <CardBody className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="rounded-2xl border border-lc-purple/20 bg-lc-purple/10 p-4 text-lc-purple">
              <Package size={28} />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-lc-gray">
                Catalogo Demo
              </p>
              <p className="text-2xl font-bold text-lc-white">
                {adminDemoDashboardStats.productsCount}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card glass>
          <CardBody className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="rounded-2xl border border-lc-pink/20 bg-lc-pink/10 p-4 text-lc-pink">
              <Users size={28} />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-lc-gray">
                Clientes Demo
              </p>
              <p className="text-2xl font-bold text-lc-white">
                {adminDemoDashboardStats.usersCount}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <BusinessExportDemoPanel />
    </div>
  )
}
