import { prisma } from "@/lib/prisma"
import {
  adminCouponSelect,
  serializeAdminCoupon,
} from "@/lib/admin-coupons"
import { AdminCouponsManager } from "@/components/admin/AdminCouponsManager"

export const dynamic = "force-dynamic"

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    select: adminCouponSelect,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-lc-white">
          Cupones de descuento
        </h1>
        <p className="mt-1 text-sm text-lc-gray">
          Crea, activa y controla promociones reales para el checkout.
        </p>
      </div>

      <AdminCouponsManager initialCoupons={coupons.map(serializeAdminCoupon)} />
    </div>
  )
}
