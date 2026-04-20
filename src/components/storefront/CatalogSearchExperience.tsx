"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Loader2, Search } from "lucide-react"
import {
  ProductCard,
  type ProductCardProduct,
} from "@/components/storefront/ProductCard"
import { cn, formatCOP } from "@/lib/utils"

type Category = {
  id: string
  name: string
  slug: string
}

type CatalogSearchExperienceProps = {
  categories: Category[]
  initialProducts: ProductCardProduct[]
  initialCategorySlug?: string
  initialSearchQuery?: string
}

export function CatalogSearchExperience({
  categories,
  initialProducts,
  initialCategorySlug,
  initialSearchQuery,
}: CatalogSearchExperienceProps) {
  const pathname = usePathname()
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>(
    initialCategorySlug
  )
  const [query, setQuery] = React.useState(initialSearchQuery ?? "")
  const deferredQuery = React.useDeferredValue(query)
  const [products, setProducts] = React.useState<ProductCardProduct[]>(initialProducts)
  const [isLoading, setIsLoading] = React.useState(false)

  const normalizedRawQuery = deferredQuery.trim().replace(/\s+/g, " ")
  const normalizedInitialQuery = (initialSearchQuery ?? "").trim().replace(/\s+/g, " ")
  const activeQuery = normalizedRawQuery.length >= 3 ? normalizedRawQuery : ""
  const initialActiveQuery = normalizedInitialQuery.length >= 3 ? normalizedInitialQuery : ""
  const isShortQuery = normalizedRawQuery.length > 0 && normalizedRawQuery.length < 3
  const activeCategoryName =
    categories.find((category) => category.slug === selectedCategory)?.name || selectedCategory

  React.useEffect(() => {
    const params = new URLSearchParams()

    if (selectedCategory) {
      params.set("categoria", selectedCategory)
    }

    if (query.trim()) {
      params.set("q", query.trim())
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    const currentUrl =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname

    if (nextUrl !== currentUrl && typeof window !== "undefined") {
      window.history.replaceState(null, "", nextUrl)
    }
  }, [pathname, query, selectedCategory])

  React.useEffect(() => {
    const isInitialState =
      selectedCategory === initialCategorySlug && activeQuery === initialActiveQuery

    if (isInitialState) {
      setProducts(initialProducts)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams()
    params.set("limit", "24")

    if (selectedCategory) {
      params.set("category", selectedCategory)
    }

    if (activeQuery) {
      params.set("q", activeQuery)
    }

    setIsLoading(true)

    fetch(`/api/products?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No pudimos actualizar el catálogo.")
        }

        return response.json()
      })
      .then((data: ProductCardProduct[]) => {
        setProducts(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }

        console.error(error)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [
    activeQuery,
    initialActiveQuery,
    initialCategorySlug,
    initialProducts,
    selectedCategory,
  ])

  function handleCategoryChange(nextCategory?: string) {
    setSelectedCategory(nextCategory)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  const title = activeQuery
    ? `Resultados para "${activeQuery}"`
    : selectedCategory
      ? `Categoría: ${activeCategoryName}`
      : "Catálogo Completo"

  const subtitle = isShortQuery
    ? "Escribe al menos 3 letras para activar resultados dinámicos más precisos."
    : isLoading
      ? "Buscando productos..."
      : `Mostrando ${products.length} productos`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full shrink-0 space-y-8 md:w-64">
          <div>
            <h3 className="mb-4 text-lg font-bold font-heading text-lc-white">Buscar</h3>
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Hoodie, sneakers..."
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-lc-border bg-lc-dark py-2.5 text-sm text-lc-white focus:outline-none focus:border-lc-purple"
                style={{ paddingLeft: "2.5rem", paddingRight: "1rem" }}
              />
              <Search size={18} className="absolute left-3 top-3 text-lc-gray" />
            </form>

            <div className="mt-3 min-h-6 text-xs text-lc-gray">
              {isShortQuery
                ? "Sigue escribiendo para ver coincidencias más precisas."
                : activeQuery
                  ? "La búsqueda se actualiza mientras escribes."
                  : "Puedes buscar por nombre, estilo o categoría."}
            </div>

            {activeQuery && products.length > 0 ? (
              <div className="mt-4 space-y-2 rounded-2xl border border-lc-border bg-lc-card/80 p-3">
                {products.slice(0, 4).map((product) => {
                  const imageUrl =
                    product.images?.[0]?.url ||
                    "https://placehold.co/120x120/1A1A2E/8B8B9E?text=Sin+Imagen"

                  return (
                    <Link
                      key={product.id}
                      href={`/productos/${product.slug}`}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-lc-dark"
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-xl border border-lc-border bg-lc-dark">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={product.images?.[0]?.altText || product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-lc-white">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-lc-gray">
                          {formatCOP(product.price)}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold font-heading text-lc-white">Categorías</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleCategoryChange(undefined)}
                className={cn(
                  "block py-1.5 text-sm transition-colors",
                  !selectedCategory
                    ? "font-semibold text-lc-purple"
                    : "text-lc-gray hover:text-lc-white"
                )}
              >
                Todas
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={cn(
                    "block py-1.5 text-left text-sm transition-colors",
                    selectedCategory === category.slug
                      ? "font-semibold text-lc-purple"
                      : "text-lc-gray hover:text-lc-white"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-lc-white mb-2">{title}</h1>
              <p className="text-sm text-lc-gray">{subtitle}</p>
            </div>

            {isLoading ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-lc-border bg-lc-card px-4 py-2 text-sm text-lc-gray-light">
                <Loader2 size={16} className="animate-spin text-lc-purple" />
                Actualizando resultados
              </div>
            ) : null}
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-lc-border bg-lc-dark p-12 text-center">
              <p className="mb-4 text-lc-gray">
                No encontramos productos que coincidan con tu búsqueda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setSelectedCategory(undefined)
                }}
                className="btn-secondary inline-block"
              >
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
