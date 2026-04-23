import { ProductForm } from "@/components/admin/ProductForm"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [categories, product] = await Promise.all([
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          orderBy: { sku: "asc" },
        },
      },
    }),
  ])

  if (!product) {
    notFound()
  }

  return (
    <ProductForm
      productId={id}
      initialCategories={categories}
      initialProduct={product}
    />
  )
}
