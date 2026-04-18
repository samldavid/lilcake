import { prisma } from "@/lib/prisma"
import { Search } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      _count: { select: { orders: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-lc-white">Clientes</h1>
          <p className="text-lc-gray text-sm mt-1">Directorio de usuarios registrados en LilCake.</p>
        </div>
      </div>

      <div className="bg-lc-card rounded-2xl shadow-sm border border-lc-border overflow-hidden">
        <div className="p-4 border-b border-lc-border">
           <div className="relative max-w-sm">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-lc-gray" />
             <input 
               type="text" 
               placeholder="Buscar por nombre, email o teléfono..." 
               className="w-full bg-lc-darker border border-lc-border rounded-xl pl-10 pr-4 py-2 text-sm text-lc-white focus:outline-none focus:border-lc-purple transition-colors"
             />
           </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-lc-darker border-b border-lc-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-center">Pedidos Completados</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-right">Fecha de Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lc-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-lc-gray">
                    No hay clientes registrados aún.
                  </td>
                </tr>
              ) : users.map(user => {
                const displayName =
                  user.name?.trim() ||
                  user.email?.split("@")[0] ||
                  "Cliente"
                const displayInitial = displayName.charAt(0).toUpperCase()

                return (
                <tr key={user.id} className="hover:bg-lc-dark/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-lc-purple to-lc-pink flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
                        {displayInitial}
                      </div>
                      <div className="font-bold text-lc-white text-sm">{displayName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-lc-white">{user.email}</div>
                    {user.phone && <div className="text-xs text-lc-gray mt-0.5">{user.phone}</div>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center bg-lc-purple/10 text-lc-purple font-bold h-8 w-8 rounded-full border border-lc-purple/20">
                      {user._count.orders}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-lc-gray">
                    {new Date(user.createdAt).toLocaleDateString('es-CO')}
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
