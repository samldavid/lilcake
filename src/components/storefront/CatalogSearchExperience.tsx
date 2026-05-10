"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Loader2, Search, SlidersHorizontal } from "lucide-react"
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

type SortMode = "featured" | "price-asc" | "price-desc" | "name"

export function CatalogSearchExperience({
  categories,
  initialProducts,
  initialCategorySlug,
  initialSearchQuery,
}: CatalogSearchExperienceProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedCategory, setSelectedCategory] = React.useState<string | undefined>(
    initialCategorySlug
  )
  const [query, setQuery] = React.useState(initialSearchQuery ?? "")
  const deferredQuery = React.useDeferredValue(query)
  const [products, setProducts] = React.useState<ProductCardProduct[]>(initialProducts)
  const [isLoading, setIsLoading] = React.useState(false)
  const [sortMode, setSortMode] = React.useState<SortMode>("featured")

  const normalizedRawQuery = deferredQuery.trim().replace(/\s+/g, " ")
  const normalizedInitialQuery = (initialSearchQuery ?? "").trim().replace(/\s+/g, " ")
  const activeQuery = normalizedRawQuery.length >= 3 ? normalizedRawQuery : ""
  const initialActiveQuery = normalizedInitialQuery.length >= 3 ? normalizedInitialQuery : ""
  const isShortQuery = normalizedRawQuery.length > 0 && normalizedRawQuery.length < 3
  const activeCategoryName =
    categories.find((category) => category.slug === selectedCategory)?.name ||
    selectedCategory

  const sortedProducts = React.useMemo(() => {
    const nextProducts = [...products]

    if (sortMode === "price-asc") {
      nextProducts.sort((a, b) => a.price - b.price)
    }

    if (sortMode === "price-desc") {
      nextProducts.sort((a, b) => b.price - a.price)
    }

    if (sortMode === "name") {
      nextProducts.sort((a, b) => a.name.localeCompare(b.name, "es"))
    }

    return nextProducts
  }, [products, sortMode])

  React.useEffect(() => {
    setSelectedCategory(initialCategorySlug)
    setQuery(initialSearchQuery ?? "")
    setProducts(initialProducts)
    setIsLoading(false)
  }, [initialCategorySlug, initialProducts, initialSearchQuery])

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

    if (nextUrl !== currentUrl) {
      React.startTransition(() => {
        router.replace(nextUrl, { scroll: false })
      })
    }
  }, [pathname, query, router, selectedCategory])

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
      ? activeCategoryName || "Categoria"
      : "Catalogo"

  const subtitle = isShortQuery
    ? "Escribe al menos 3 letras para buscar con mas precision."
    : isLoading
      ? "Actualizando productos..."
      : `${sortedProducts.length} productos disponibles`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8 border-b border-lc-border pb-6">
        <p className="mb-3 text-sm font-semibold text-lc-purple-light">
          Tienda LilCake
        </p>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-lc-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-lc-gray-light">{subtitle}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block min-w-52">
              <span className="sr-only">Ordenar productos</span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="h-11 w-full rounded-md border border-lc-border bg-lc-card px-3 text-sm font-semibold text-lc-white outline-none transition-colors focus:border-lc-gray-light"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="name">Nombre</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <aside className="w-full shrink-0 lg:w-72">
          <div className="sticky top-24 space-y-6 rounded-lg border border-lc-border bg-lc-card p-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-lc-white">
                <Search size={17} />
                Buscar
              </div>
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Hoodie, sneakers..."
                  autoComplete="off"
                  spellCheck={false}
                  className="input-field h-11 text-sm"
                  style={{ paddingLeft: "2.5rem", paddingRight: "1rem" }}
                />
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-lc-gray"
                />
              </form>
              <p className="mt-3 text-xs leading-5 text-lc-gray">
                {isShortQuery
                  ? "Sigue escribiendo para activar resultados."
                  : activeQuery
                    ? "Los resultados se actualizan al escribir."
                    : "Busca por nombre, estilo o categoria."}
              </p>

              {activeQuery && sortedProducts.length > 0 ? (
                <div className="mt-4 space-y-2 border-t border-lc-border pt-4">
                  {sortedProducts.slice(0, 4).map((product) => {
                    const imageUrl =
                      product.images?.[0]?.url ||
                      "https://placehold.co/120x120/181818/C8C5BD?text=Sin+Imagen"

                    return (
                      <Link
                        key={product.id}
                        href={`/productos/${product.slug}`}
                        className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-lc-dark"
                      >
                        <div className="h-12 w-12 overflow-hidden rounded-md border border-lc-border bg-lc-dark">
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
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-lc-white">
                <SlidersHorizontal size={17} />
                Categorias
              </div>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                <button
                  type="button"
                  onClick={() => handleCategoryChange(undefined)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                    !selectedCategory
                      ? "border-lc-purple bg-lc-purple/10 font-semibold text-lc-white"
                      : "border-lc-border text-lc-gray-light hover:border-lc-gray-light hover:text-lc-white"
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
                      "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      selectedCategory === category.slug
                        ? "border-lc-purple bg-lc-purple/10 font-semibold text-lc-white"
                        : "border-lc-border text-lc-gray-light hover:border-lc-gray-light hover:text-lc-white"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-lc-border bg-lc-card px-4 py-2 text-sm text-lc-gray-light">
              <Loader2 size={16} className="animate-spin text-lc-purple" />
              Actualizando resultados
            </div>
          ) : null}

          {sortedProducts.length === 0 ? (
            <div className="rounded-lg border border-lc-border bg-lc-card p-8 text-center sm:p-12">
              <p className="mb-4 text-lc-gray-light">
                No encontramos productos que coincidan con tu busqueda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setSelectedCategory(undefined)
                }}
                className="btn-secondary inline-flex"
              >
                Ver todo el catalogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
