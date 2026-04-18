import { Card, CardBody } from "@/components/ui/Card"
import { TrendingUp, ShoppingCart, Package, Users } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatCOP } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  // Fetch basic stats
  const productsCount = await prisma.product.count()
  const ordersCount = await prisma.order.count()
  const usersCount = await prisma.user.count({ where: { role: "CUSTOMER" } })
  const salesResult = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { notIn: ["CANCELLED", "PENDING"] } }
  })
  const totalSales = salesResult._sum.total || 0

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-lc-white mb-2">Resumen General</h1>
        <p className="text-lc-gray-light">Métricas principales de tu negocio.</p>
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        <Card glass>
          <CardBody className="p-6 flex items-center">
            <div className="p-4 bg-lc-success/10 rounded-2xl text-lc-success shrink-0 mr-4 border border-lc-success/20">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-lc-gray tracking-wide uppercase mb-1">Ventas Reales</p>
              <p className="text-2xl font-bold text-lc-white">{formatCOP(totalSales)}</p>
            </div>
          </CardBody>
        </Card>

        <Card glass>
          <CardBody className="p-6 flex items-center">
            <div className="p-4 bg-lc-cyan/10 rounded-2xl text-lc-cyan shrink-0 mr-4 border border-lc-cyan/20">
              <ShoppingCart size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-lc-gray tracking-wide uppercase mb-1">Pedidos Totales</p>
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
              <p className="text-sm font-semibold text-lc-gray tracking-wide uppercase mb-1">Catálogo Activo</p>
              <p className="text-2xl font-bold text-lc-white">{productsCount}</p>
            </div>
          </CardBody>
        </Card>

        <Card glass>
          <CardBody className="p-6 flex items-center">
            <div className="p-4 bg-lc-pink/10 rounded-2xl text-lc-pink shrink-0 mr-4 border border-lc-pink/20">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-lc-gray tracking-wide uppercase mb-1">Clientes Registrados</p>
              <p className="text-2xl font-bold text-lc-white">{usersCount}</p>
            </div>
          </CardBody>
        </Card>

      </div>

      {/* Chart Placeholder Area */}
      <Card className="h-96 w-full flex flex-col justify-center items-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-lc-purple/5 to-lc-cyan/5"></div>
        <div className="relative z-10 text-center">
          <TrendingUp size={48} className="mx-auto mb-4 text-lc-gray opacity-30 group-hover:scale-110 group-hover:opacity-100 group-hover:text-lc-cyan transition-all duration-500" />
          <h3 className="text-xl font-bold text-lc-gray group-hover:text-lc-white transition-colors">Analíticas Detalladas</h3>
          <p className="text-sm text-lc-gray/60 mt-2">Los gráficos de ventas estarán disponibles próximamente.</p>
        </div>
      </Card>
    </div>
  )
}
