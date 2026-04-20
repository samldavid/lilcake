import { prisma } from "@/lib/prisma"
import { AdminCustomersTable } from "@/components/admin/AdminCustomersTable"

export const dynamic = "force-dynamic"

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      _count: { select: { orders: true } },
      accounts: {
        select: {
          provider: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-lc-white">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-lc-gray">
            Directorio de usuarios registrados en LilCake.
          </p>
        </div>
      </div>

      <AdminCustomersTable
        users={users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}
