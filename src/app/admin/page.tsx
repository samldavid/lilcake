import { TrendingUp, ShoppingCart, Package, Users } from "lucide-react"
import { BusinessExportPanel } from "@/components/admin/BusinessExportPanel"
import { Card, CardBody } from "@/components/ui/Card"
import {
  DEFAULT_REPORT_FILTERS,
  getReportSummary,
} from "@/lib/business-reports"
import { prisma } from "@/lib/prisma"
import { formatCOP } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const [productsCount, ordersCount, usersCount, salesResult, initialSummary] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { notIn: ["CANCELLED", "PENDING"] } },
      }),
      getReportSummary(DEFAULT_REPORT_FILTERS),
    ])
  const totalSales = salesResult._sum.total || 0

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-lc-white mb-2">
          Resumen General
        </h1>
        <p className="text-lc-gray-light">
          Métricas principales de tu negocio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card glass>
          <CardBody className="p-6 flex items-center">
            <div className="p-4 bg-lc-success/10 rounded-2xl text-lc-success shrink-0 mr-4 border border-lc-success/20">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-lc-gray tracking-wide uppercase mb-1">
                Ventas Reales
              </p>
              <p className="text-2xl font-bold text-lc-white">
                {formatCOP(totalSales)}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card glass>
          <CardBody className="p-6 flex items-center">
            <div className="p-4 bg-lc-cyan/10 rounded-2xl text-lc-cyan shrink-0 mr-4 border border-lc-cyan/20">
              <ShoppingCart size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-lc-gray tracking-wide uppercase mb-1">
                Pedidos Totales
              </p>
              <p className="text-2xl font-bold text-lc-white">{ordersCount}</p>
            </div>
          </CardBody>
        </Card>

        <Card glass>
          <CardBody className="p-6 flex items-center">
            <div className="p-4 bg-lc-purple/10 rounded-2xl text-lc-purple shrink-0 mr-4 border border-lc-purple/20">
              <Package size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-lc-gray tracking-wide uppercase mb-1">
                Catálogo Activo
              </p>
              <p className="text-2xl font-bold text-lc-white">
                {productsCount}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card glass>
          <CardBody className="p-6 flex items-center">
            <div className="p-4 bg-lc-pink/10 rounded-2xl text-lc-pink shrink-0 mr-4 border border-lc-pink/20">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-lc-gray tracking-wide uppercase mb-1">
                Clientes Registrados
              </p>
              <p className="text-2xl font-bold text-lc-white">{usersCount}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <BusinessExportPanel initialSummary={initialSummary} />
    </div>
  )
}
