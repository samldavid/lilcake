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
    categories.find((category) => category.slug === selectedCategory)?.name ||
    selectedCategory

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
          throw new Error("No pudimos actualizar el catalogo.")
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
      ? `Categoria: ${activeCategoryName}`
      : "Catalogo Completo"

  const subtitle = isShortQuery
    ? "Escribe al menos 3 letras para activar resultados dinamicos mas precisos."
    : isLoading
      ? "Buscando productos..."
      : `Mostrando ${products.length} productos`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 animate-fade-in">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="w-full shrink-0 space-y-6 lg:w-72 lg:space-y-8">
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
                className="h-12 w-full rounded-xl border border-lc-border bg-lc-dark py-2.5 text-sm text-lc-white focus:border-lc-purple focus:outline-none"
                style={{ paddingLeft: "2.5rem", paddingRight: "1rem" }}
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-lc-gray" />
            </form>

            <div className="mt-3 min-h-6 text-xs text-lc-gray">
              {isShortQuery
                ? "Sigue escribiendo para ver coincidencias mas precisas."
                : activeQuery
                  ? "La busqueda se actualiza mientras escribes."
                  : "Puedes buscar por nombre, estilo o categoria."}
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
            <h3 className="mb-4 text-lg font-bold font-heading text-lc-white">Categorias</h3>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange(undefined)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors lg:rounded-none lg:border-0 lg:px-0 lg:py-1.5",
                  !selectedCategory
                    ? "border-lc-purple/40 bg-lc-purple/10 font-semibold text-lc-purple lg:bg-transparent"
                    : "border-lc-border text-lc-gray hover:border-lc-purple/40 hover:text-lc-white lg:hover:border-transparent"
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
                    "rounded-full border px-4 py-2 text-left text-sm transition-colors lg:rounded-none lg:border-0 lg:px-0 lg:py-1.5",
                    selectedCategory === category.slug
                      ? "border-lc-purple/40 bg-lc-purple/10 font-semibold text-lc-purple lg:bg-transparent"
                      : "border-lc-border text-lc-gray hover:border-lc-purple/40 hover:text-lc-white lg:hover:border-transparent"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-heading font-bold text-lc-white sm:text-3xl">
                {title}
              </h1>
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
            <div className="rounded-2xl border border-lc-border bg-lc-dark p-8 text-center sm:p-12">
              <p className="mb-4 text-lc-gray">
                No encontramos productos que coincidan con tu busqueda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setSelectedCategory(undefined)
                }}
                className="btn-secondary inline-block"
              >
                Ver todo el catalogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
