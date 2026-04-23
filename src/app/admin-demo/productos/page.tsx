import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { AdminProductsTable } from "@/components/admin/AdminProductsTable"
import { ADMIN_DEMO_NOTICE, adminDemoProducts } from "@/lib/admin-demo-data"

export default function AdminDemoProductsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-lc-white">Productos</h1>
          <p className="mt-1 text-sm text-lc-gray">
            Explora catalogo, inventario y edicion en modo sandbox.
          </p>
        </div>
        <Link href="/admin-demo/productos/nuevo">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Nuevo Producto
          </Button>
        </Link>
      </div>

      <AdminProductsTable
        products={adminDemoProducts}
        basePath="/admin-demo"
        demoMode
        demoNotice={ADMIN_DEMO_NOTICE}
      />
    </div>
  )
}
