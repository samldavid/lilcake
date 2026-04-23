"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
  ProductForm,
  type ProductFormSeed,
  type ProductFormSubmitPayload,
} from "@/components/admin/ProductForm"
import { Button } from "@/components/ui/Button"
import {
  ADMIN_DEMO_NOTICE,
  adminDemoCategories,
} from "@/lib/admin-demo-data"
import {
  getAdminDemoProductFromStore,
  upsertAdminDemoProduct,
} from "@/lib/admin-demo-product-store"

export function AdminDemoProductFormClient({
  productId,
}: {
  productId?: string
}) {
  const [demoProduct, setDemoProduct] = React.useState<ProductFormSeed | null>(
    productId ? null : null
  )
  const [isReady, setIsReady] = React.useState(productId ? false : true)

  React.useEffect(() => {
    if (!productId) {
      setIsReady(true)
      setDemoProduct(null)
      return
    }

    setDemoProduct(getAdminDemoProductFromStore(productId))
    setIsReady(true)
  }, [productId])

  if (!isReady) {
    return (
      <div className="max-w-5xl animate-fade-in space-y-6">
        <div className="h-10 w-56 animate-pulse rounded-2xl bg-lc-card" />
        <div className="h-80 animate-pulse rounded-3xl bg-lc-card" />
      </div>
    )
  }

  if (productId && !demoProduct) {
    return (
      <div className="max-w-3xl animate-fade-in space-y-6 rounded-3xl border border-lc-border bg-lc-card p-8">
        <div className="flex items-center gap-3 text-lc-white">
          <ArrowLeft size={18} className="text-lc-gray" />
          <h1 className="text-2xl font-bold font-heading">
            Producto demo no encontrado
          </h1>
        </div>
        <p className="text-sm text-lc-gray">
          Puede que lo hayas eliminado o reiniciado el sandbox en este
          navegador. Vuelve al catalogo demo para seguir probando.
        </p>
        <Link href="/admin-demo/productos">
          <Button>Volver a productos demo</Button>
        </Link>
      </div>
    )
  }

  const handleDemoSave = (payload: ProductFormSubmitPayload) => {
    upsertAdminDemoProduct(payload, productId)
  }

  return (
    <ProductForm
      productId={productId}
      mode="demo"
      basePath="/admin-demo"
      demoCategories={adminDemoCategories}
      demoProduct={demoProduct}
      demoNotice={ADMIN_DEMO_NOTICE}
      onDemoSave={handleDemoSave}
    />
  )
}
