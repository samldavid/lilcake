import { ProductForm } from "@/components/admin/ProductForm"
import {
  ADMIN_DEMO_NOTICE,
  adminDemoCategories,
} from "@/lib/admin-demo-data"

export default function AdminDemoNuevoProductoPage() {
  return (
    <ProductForm
      mode="demo"
      basePath="/admin-demo"
      demoCategories={adminDemoCategories}
      demoNotice={ADMIN_DEMO_NOTICE}
    />
  )
}
