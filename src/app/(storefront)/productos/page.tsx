import { CatalogSearchExperience } from "@/components/storefront/CatalogSearchExperience"
import { getCatalogProducts, getStorefrontCategories } from "@/lib/storefront-data"

export const revalidate = 60

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const categorySlug =
    typeof resolvedParams.categoria === "string" ? resolvedParams.categoria : undefined
  const searchQuery = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined

  const [products, categories] = await Promise.all([
    getCatalogProducts(categorySlug, searchQuery),
    getStorefrontCategories(),
  ])

  return (
    <CatalogSearchExperience
      categories={categories}
      initialProducts={products}
      initialCategorySlug={categorySlug}
      initialSearchQuery={searchQuery}
    />
  )
}
