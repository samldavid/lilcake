import Link from "next/link"
import { Plus } from "lucide-react"
import { AdminProductsTable } from "@/components/admin/AdminProductsTable"
import { Button } from "@/components/ui/Button"
import { prisma } from "@/lib/prisma"

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
    <div className="animate-fade-in space-y-5 sm:space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold text-lc-white sm:text-3xl">
            Productos
          </h1>
          <p className="mt-1 text-sm text-lc-gray">
            Gestiona tu catalogo, inventario y variantes.
          </p>
        </div>
        <Link href="/admin/productos/nuevo" className="w-full sm:w-auto">
          <Button className="flex w-full items-center justify-center gap-2">
            <Plus size={18} /> Nuevo Producto
          </Button>
        </Link>
      </div>

      <AdminProductsTable products={products} />
    </div>
  )
}
