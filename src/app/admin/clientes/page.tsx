import { Search } from "lucide-react"
import { prisma } from "@/lib/prisma"

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

      <div className="overflow-hidden rounded-2xl border border-lc-border bg-lc-card shadow-sm">
        <div className="border-b border-lc-border p-4">
          <div className="relative max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-lc-gray"
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email o telefono..."
              className="w-full rounded-xl border border-lc-border bg-lc-darker py-2 pl-10 pr-4 text-sm text-lc-white transition-colors focus:border-lc-purple focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full whitespace-nowrap text-left">
            <thead className="border-b border-lc-border bg-lc-darker">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Cliente
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Contacto
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Acceso
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Pedidos Completados
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-lc-gray">
                  Fecha de Registro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lc-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-lc-gray">
                    No hay clientes registrados aun.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const displayName =
                    user.name?.trim() || user.email?.split("@")[0] || "Cliente"
                  const displayInitial = displayName.charAt(0).toUpperCase()
                  const accessMethods = [
                    ...(user.password ? ["Correo"] : []),
                    ...new Set(
                      user.accounts.map((account) =>
                        account.provider === "google"
                          ? "Google"
                          : account.provider
                      )
                    ),
                  ]

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-lc-dark/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-lc-purple to-lc-pink text-sm font-bold text-white shadow-lg">
                            {displayInitial}
                          </div>
                          <div className="text-sm font-bold text-lc-white">
                            {displayName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-lc-white">{user.email}</div>
                        {user.phone ? (
                          <div className="mt-0.5 text-xs text-lc-gray">
                            {user.phone}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {accessMethods.length === 0 ? (
                            <span className="rounded-full border border-lc-border px-3 py-1 text-xs text-lc-gray">
                              Sin acceso
                            </span>
                          ) : (
                            accessMethods.map((method) => (
                              <span
                                key={method}
                                className="rounded-full border border-lc-purple/20 bg-lc-purple/10 px-3 py-1 text-xs font-semibold text-lc-purple"
                              >
                                {method}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-lc-purple/20 bg-lc-purple/10 font-bold text-lc-purple">
                          {user._count.orders}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-lc-gray">
                        {new Date(user.createdAt).toLocaleDateString("es-CO")}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
