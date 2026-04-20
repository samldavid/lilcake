import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { prisma } from "@/lib/prisma"
import { AdminProductsTable } from "@/components/admin/AdminProductsTable"

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
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-lc-white">Productos</h1>
          <p className="text-lc-gray text-sm mt-1">
            Gestiona tu catálogo, inventario y variantes.
          </p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Nuevo Producto
          </Button>
        </Link>
      </div>

      <AdminProductsTable products={products} />
    </div>
  )
}
