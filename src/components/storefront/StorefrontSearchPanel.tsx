"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Search, Sparkles, X } from "lucide-react"
import { cn, formatCOP } from "@/lib/utils"
import type { ProductCardProduct } from "@/components/storefront/ProductCard"

type SearchPanelProduct = ProductCardProduct & {
  category?: {
    name: string
    slug?: string
  }
}

type StorefrontSearchPanelProps = {
  open: boolean
  onClose: () => void
}

export function StorefrontSearchPanel({
  open,
  onClose,
}: StorefrontSearchPanelProps) {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState("")
  const deferredQuery = React.useDeferredValue(query)
  const [products, setProducts] = React.useState<SearchPanelProduct[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const normalizedQuery = deferredQuery.trim().replace(/\s+/g, " ")
  const isShortQuery = normalizedQuery.length > 0 && normalizedQuery.length < 3
  const hasActiveQuery = normalizedQuery.length >= 3

  React.useEffect(() => {
    if (!open) {
      return
    }

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 120)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, open])

  React.useEffect(() => {
    if (!open) {
      return
    }

    if (isShortQuery) {
      setIsLoading(false)
      setProducts([])
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams()
    params.set("limit", "6")

    if (hasActiveQuery) {
      params.set("q", normalizedQuery)
    } else {
      params.set("featured", "true")
    }

    setIsLoading(true)

    fetch(`/api/products?${params.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No pudimos completar la búsqueda.")
        }

        return response.json()
      })
      .then((data: SearchPanelProduct[]) => {
        setProducts(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }

        console.error(error)
        setProducts([])
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [hasActiveQuery, isShortQuery, normalizedQuery, open])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const submittedQuery = query.trim().replace(/\s+/g, " ")

    if (submittedQuery.length < 3) {
      return
    }

    React.startTransition(() => {
      router.push(`/productos?q=${encodeURIComponent(submittedQuery)}`)
      onClose()
    })
  }

  const panelTitle = hasActiveQuery
    ? `Resultados para "${normalizedQuery}"`
    : "Buscar productos"
  const helperText = isShortQuery
    ? "Escribe al menos 3 letras para activar la búsqueda inteligente."
    : hasActiveQuery
      ? `${products.length} coincidencias relevantes`
      : "Descubre productos destacados o empieza a escribir para buscar."

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] transition-opacity duration-300",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Cerrar búsqueda"
        className="absolute inset-0 bg-black/72 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-lc-border bg-lc-darker shadow-[-24px_0_60px_rgba(0,0,0,0.45)] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-lc-border px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lc-gray">
              Búsqueda
            </p>
            <h2 className="mt-2 text-2xl font-heading font-bold text-lc-white">
              {panelTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-lc-border text-lc-gray transition-colors hover:text-lc-white"
            aria-label="Cerrar panel de búsqueda"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-lc-border px-5 py-5 sm:px-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lc-gray"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Busca por nombre, categoría o estilo..."
                autoComplete="off"
                spellCheck={false}
                className="input-field min-h-14"
                style={{ paddingLeft: "3rem", paddingRight: "1rem" }}
              />
            </div>
            <button
              type="submit"
              disabled={query.trim().length < 3}
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-lc-purple px-5 text-sm font-semibold text-white transition-all hover:bg-lc-purple-light disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-28"
            >
              Buscar
            </button>
          </form>
          <p className="mt-3 text-sm text-lc-gray">{helperText}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {isLoading ? (
            <div className="flex h-full min-h-56 items-center justify-center">
              <div className="flex items-center gap-3 rounded-2xl border border-lc-border bg-lc-card px-5 py-4 text-sm text-lc-gray-light">
                <Loader2 size={18} className="animate-spin text-lc-purple" />
                Buscando productos...
              </div>
            </div>
          ) : isShortQuery ? (
            <div className="rounded-3xl border border-dashed border-lc-border bg-lc-card/60 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-lc-purple/10 p-3 text-lc-purple-light">
                  <Search size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-lc-white">
                    Sigue escribiendo
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-lc-gray-light">
                    A partir de 3 letras te mostramos coincidencias cada vez más precisas.
                  </p>
                </div>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-lc-border bg-lc-card/60 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-lc-pink/10 p-3 text-lc-pink">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-lc-white">
                    No encontramos coincidencias
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-lc-gray-light">
                    Prueba con otro nombre, una categoría o una descripción más específica.
                  </p>
                  <Link
                    href="/productos"
                    onClick={onClose}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lc-purple transition-colors hover:text-lc-white"
                  >
                    Ver catálogo completo <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const imageUrl =
                  product.images?.[0]?.url ||
                  "https://placehold.co/160x160/1A1A2E/8B8B9E?text=Sin+Imagen"

                return (
                  <Link
                    key={product.id}
                    href={`/productos/${product.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 rounded-3xl border border-lc-border bg-lc-card/70 p-3 transition-all hover:border-lc-purple hover:bg-lc-card"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-lc-border bg-lc-dark">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={product.images?.[0]?.altText || product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold uppercase tracking-[0.14em] text-lc-purple-light">
                            {product.category?.name || "LilCake"}
                          </p>
                          <h3 className="mt-1 truncate text-lg font-heading font-bold text-lc-white">
                            {product.name}
                          </h3>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-base font-bold text-lc-white">
                            {formatCOP(product.price)}
                          </p>
                          {product.compareAtPrice ? (
                            <p className="text-xs text-lc-gray line-through decoration-lc-pink">
                              {formatCOP(product.compareAtPrice)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="border-t border-lc-border px-5 py-4 sm:px-6">
          <Link
            href={
              hasActiveQuery
                ? `/productos?q=${encodeURIComponent(normalizedQuery)}`
                : "/productos"
            }
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-semibold text-lc-white transition-colors hover:text-lc-purple"
          >
            {hasActiveQuery ? "Ver resultados completos" : "Explorar todo el catálogo"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </aside>
    </div>
  )
}
