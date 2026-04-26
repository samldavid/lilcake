import { AdminCouponsManager } from "@/components/admin/AdminCouponsManager"
import {
  adminCouponSelect,
  serializeAdminCoupon,
} from "@/lib/admin-coupons"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    select: adminCouponSelect,
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="animate-fade-in space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-lc-white sm:text-3xl">
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
