import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react"
import { formatCOP } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      compareAtPrice: true,
      isActive: true,
      category: {
        select: {
          name: true,
        },
      },
      variants: {
        select: {
          stock: true,
        },
      },
      images: {
        select: {
          url: true,
        },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-lc-white">Productos</h1>
          <p className="text-lc-gray text-sm mt-1">Gestiona tu catálogo, inventario y variantes.</p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-lc-card p-4 rounded-2xl border border-lc-border">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-lc-gray" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            className="w-full bg-lc-darker border border-lc-border rounded-xl pl-10 pr-4 py-2 text-sm text-lc-white focus:outline-none focus:border-lc-purple transition-colors"
          />
        </div>
        <Button variant="secondary" className="flex items-center gap-2 px-4 whitespace-nowrap">
          <Filter size={18} /> Filtrar
        </Button>
      </div>

      <div className="bg-lc-card rounded-2xl shadow-sm border border-lc-border overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-lc-darker border-b border-lc-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-right">Precio</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-center">Variantes / Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-center">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lc-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-lc-gray">
                    No hay productos registrados. <Link href="/admin/productos/nuevo" className="text-lc-purple hover:underline">Empieza agregando uno.</Link>
                  </td>
                </tr>
              ) : products.map(product => {
                const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0)
                const mainImage = product.images[0]?.url || "https://placehold.co/100x100/1A1A2E/8B8B9E?text=Img"

                return (
                  <tr key={product.id} className="hover:bg-lc-dark/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-lc-black overflow-hidden border border-lc-border shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-lc-white text-sm max-w-xs truncate">{product.name}</div>
                          <div className="text-xs text-lc-gray mt-0.5">{product.category.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-bold text-lc-white">{formatCOP(product.price)}</div>
                      {product.compareAtPrice && (
                        <div className="text-xs text-lc-gray line-through decoration-lc-pink mt-0.5">{formatCOP(product.compareAtPrice)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-lc-white font-medium">{product.variants.length} var.</div>
                      <div className={`text-xs mt-0.5 font-bold ${totalStock > 10 ? 'text-lc-success' : totalStock > 0 ? 'text-lc-warning' : 'text-lc-error'}`}>
                        {totalStock} en stock
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.isActive ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="error" className="bg-lc-dark text-lc-gray">Borrador</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <Link href={`/admin/productos/${product.id}/editar`}>
                          <button className="text-lc-gray hover:text-lc-cyan p-2 rounded-lg hover:bg-lc-cyan/10 transition-colors" title="Editar">
                            <Edit size={18} />
                          </button>
                       </Link>
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
