import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/ProductForm"
import {
  ADMIN_DEMO_NOTICE,
  adminDemoCategories,
  getAdminDemoProduct,
} from "@/lib/admin-demo-data"

export default async function AdminDemoEditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const demoProduct = getAdminDemoProduct(id)

  if (!demoProduct) {
    notFound()
  }

  return (
    <ProductForm
      productId={id}
      mode="demo"
      basePath="/admin-demo"
      demoCategories={adminDemoCategories}
      demoProduct={demoProduct}
      demoNotice={ADMIN_DEMO_NOTICE}
    />
  )
}
