import { ProductForm } from "@/components/admin/ProductForm"
import { prisma } from "@/lib/prisma"

export default async function NuevoProductoPage() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { sortOrder: "asc" },
  })

  return <ProductForm initialCategories={categories} />
}
