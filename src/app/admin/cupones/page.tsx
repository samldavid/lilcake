import { prisma } from "@/lib/prisma"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

export const dynamic = "force-dynamic"

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-lc-white">Cupones de Descuento</h1>
          <p className="text-lc-gray text-sm mt-1">Crea y administra promociones para tus clientes.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={18} /> Nuevo Cupón
        </Button>
      </div>

      <div className="bg-lc-card rounded-2xl shadow-sm border border-lc-border overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-lc-darker border-b border-lc-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider">Código</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider">Descuento</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-center">Uso</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-center">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lc-border">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-lc-gray">
                    No hay cupones activos.
                  </td>
                </tr>
              ) : coupons.map(coupon => {
                const isPercentage = coupon.type === "PERCENTAGE"
                return (
                  <tr key={coupon.id} className="hover:bg-lc-dark/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-lc-white font-mono bg-lc-darker px-3 py-1 rounded inline-block border border-lc-border">
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-lc-pink">
                        {isPercentage ? `${coupon.value}% OFF` : `$${coupon.value.toLocaleString()} OFF`}
                      </div>
                      {coupon.minPurchase ? (
                        <div className="text-xs text-lc-gray mt-0.5">Min. ${coupon.minPurchase.toLocaleString()}</div>
                      ) : (
                        <div className="text-xs text-lc-gray mt-0.5">Sin mínimo</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className="text-lc-white font-bold">{coupon.usedCount}</span>
                      <span className="text-lc-gray"> / {coupon.maxUses ? coupon.maxUses : '∞'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {coupon.isActive ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="error" className="bg-lc-dark text-lc-gray">Inactivo</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="text-lc-gray hover:text-lc-cyan p-2 rounded-lg hover:bg-lc-cyan/10 transition-colors" title="Editar">
                        <Edit size={18} />
                      </button>
                      <button className="text-lc-gray hover:text-lc-error p-2 rounded-lg hover:bg-lc-error/10 transition-colors" title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
