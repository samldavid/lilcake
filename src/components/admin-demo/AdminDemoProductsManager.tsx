"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { AdminProductsTable } from "@/components/admin/AdminProductsTable"
import { ADMIN_DEMO_NOTICE } from "@/lib/admin-demo-data"
import {
  readAdminDemoProducts,
  removeAdminDemoProduct,
  resetAdminDemoProducts,
  toAdminDemoProductRows,
} from "@/lib/admin-demo-product-store"

export function AdminDemoProductsManager() {
  const [products, setProducts] = React.useState(() =>
    toAdminDemoProductRows(readAdminDemoProducts())
  )

  React.useEffect(() => {
    setProducts(toAdminDemoProductRows(readAdminDemoProducts()))
  }, [])

  const reloadProducts = React.useCallback(() => {
    setProducts(toAdminDemoProductRows(readAdminDemoProducts()))
  }, [])

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-lc-white">Productos</h1>
          <p className="mt-1 text-sm text-lc-gray">
            Explora catalogo, inventario y edicion en modo sandbox.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => {
              resetAdminDemoProducts()
              reloadProducts()
            }}
          >
            <RotateCcw size={18} /> Reiniciar demo
          </Button>
          <Link href="/admin-demo/productos/nuevo">
            <Button className="flex items-center gap-2">
              <Plus size={18} /> Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-lc-cyan/20 bg-lc-cyan/10 p-4 text-sm text-lc-cyan">
        El sandbox de productos del demo guarda cambios solo en este navegador.
        Puedes crear, editar, borrar y reiniciar sin afectar el admin real.
      </div>

      <AdminProductsTable
        products={products}
        basePath="/admin-demo"
        demoMode
        demoNotice={ADMIN_DEMO_NOTICE}
        onDemoDelete={(productId) => {
          removeAdminDemoProduct(productId)
          reloadProducts()
        }}
      />
    </div>
  )
}
