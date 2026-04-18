import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  ProductCard,
  type ProductCardProduct,
} from "@/components/storefront/ProductCard"
import Link from "next/link"
import { Search } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const categorySlug = typeof resolvedParams.categoria === "string" ? resolvedParams.categoria : undefined
  const searchQuery = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined

  // Build Prisma query
  const query: Prisma.ProductWhereInput = { isActive: true }
  
  if (categorySlug) {
    query.category = { slug: categorySlug }
  }
  
  if (searchQuery) {
    query.name = { contains: searchQuery } // Note: SQLite contains is case-sensitive, but fine for MVP
  }

  const products = await prisma.product.findMany({
    where: query,
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      category: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  const typedProducts: ProductCardProduct[] = products

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="text-lg font-bold font-heading mb-4 text-lc-white">Buscar</h3>
            <form action="/productos" method="GET" className="relative">
              {categorySlug && <input type="hidden" name="categoria" value={categorySlug} />}
              <input 
                type="text" 
                name="q"
                defaultValue={searchQuery}
                placeholder="Hoodie, sneakers..." 
                className="w-full bg-lc-dark border border-lc-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-lc-white focus:outline-none focus:border-lc-purple"
              />
              <Search size={18} className="absolute left-3 top-3 text-lc-gray" />
            </form>
          </div>

          <div>
            <h3 className="text-lg font-bold font-heading mb-4 text-lc-white">Categorías</h3>
            <div className="space-y-2">
              <Link 
                href="/productos"
                className={`block py-1.5 text-sm transition-colors ${!categorySlug ? "text-lc-purple font-semibold" : "text-lc-gray hover:text-lc-white"}`}
              >
                Todas
              </Link>
              {categories.map((cat) => (
                <Link 
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}${searchQuery ? `&q=${searchQuery}` : ""}`}
                  className={`block py-1.5 text-sm transition-colors ${categorySlug === cat.slug ? "text-lc-purple font-semibold" : "text-lc-gray hover:text-lc-white"}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-lc-white mb-2">
              {searchQuery ? `Resultados para "${searchQuery}"` : categorySlug ? `Categoría: ${categories.find(c => c.slug === categorySlug)?.name || categorySlug}` : "Catálogo Completo"}
            </h1>
            <p className="text-lc-gray text-sm">Mostrando {products.length} productos</p>
          </div>

          {products.length === 0 ? (
            <div className="bg-lc-dark border border-lc-border rounded-2xl p-12 text-center">
              <p className="text-lc-gray mb-4">No encontramos productos que coincidan con tu búsqueda.</p>
              <Link href="/productos" className="btn-secondary inline-block">
                Ver todo el catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {typedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}
