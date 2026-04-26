import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react"
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
    <div className="animate-fade-in space-y-6 sm:space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-heading font-bold text-lc-white sm:text-3xl">
          Resumen General
        </h1>
        <p className="text-lc-gray-light">Metricas principales de tu negocio.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        <Card glass>
          <CardBody className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="rounded-2xl border border-lc-success/20 bg-lc-success/10 p-4 text-lc-success">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-lc-gray">
                Ventas Reales
              </p>
              <p className="text-2xl font-bold text-lc-white">
                {formatCOP(totalSales)}
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
                Pedidos Totales
              </p>
              <p className="text-2xl font-bold text-lc-white">{ordersCount}</p>
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
                Catalogo Activo
              </p>
              <p className="text-2xl font-bold text-lc-white">{productsCount}</p>
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
