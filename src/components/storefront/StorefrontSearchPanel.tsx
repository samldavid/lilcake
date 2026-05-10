"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Search, SearchX, X } from "lucide-react"
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
          throw new Error("No pudimos completar la busqueda.")
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
    ? "Escribe al menos 3 letras para buscar con mas precision."
    : hasActiveQuery
      ? `${products.length} coincidencias`
      : "Mira productos destacados o empieza a escribir."

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
        aria-label="Cerrar busqueda"
        className="absolute inset-0 bg-black/72 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-lc-border bg-lc-darker shadow-[-18px_0_45px_rgba(0,0,0,0.32)] transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-lc-border px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold text-lc-gray">Busqueda</p>
            <h2 className="mt-2 text-2xl font-heading font-bold text-lc-white">
              {panelTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-lc-border text-lc-gray transition-colors hover:text-lc-white"
            aria-label="Cerrar panel de busqueda"
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
                placeholder="Busca por nombre, categoria o estilo..."
                autoComplete="off"
                spellCheck={false}
                className="input-field min-h-14"
                style={{ paddingLeft: "3rem", paddingRight: "1rem" }}
              />
            </div>
            <button
              type="submit"
              disabled={query.trim().length < 3}
              className="inline-flex min-h-14 items-center justify-center rounded-md bg-lc-white px-5 text-sm font-semibold text-lc-black transition-all hover:bg-lc-purple hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-28"
            >
              Buscar
            </button>
          </form>
          <p className="mt-3 text-sm text-lc-gray">{helperText}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {isLoading ? (
            <div className="flex h-full min-h-56 items-center justify-center">
              <div className="flex items-center gap-3 rounded-md border border-lc-border bg-lc-card px-5 py-4 text-sm text-lc-gray-light">
                <Loader2 size={18} className="animate-spin text-lc-purple" />
                Buscando productos...
              </div>
            </div>
          ) : isShortQuery ? (
            <div className="rounded-lg border border-dashed border-lc-border bg-lc-card p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-md bg-lc-purple/10 p-3 text-lc-purple-light">
                  <Search size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-lc-white">
                    Sigue escribiendo
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-lc-gray-light">
                    A partir de 3 letras te mostramos coincidencias mas precisas.
                  </p>
                </div>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-lc-border bg-lc-card p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-md bg-lc-pink/10 p-3 text-lc-pink">
                  <SearchX size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold text-lc-white">
                    No encontramos coincidencias
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-lc-gray-light">
                    Prueba con otro nombre, una categoria o una descripcion mas
                    especifica.
                  </p>
                  <Link
                    href="/productos"
                    onClick={onClose}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lc-white transition-colors hover:text-lc-purple-light"
                  >
                    Ver catalogo completo <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const imageUrl =
                  product.images?.[0]?.url ||
                  "https://placehold.co/160x160/181818/C8C5BD?text=Sin+Imagen"

                return (
                  <Link
                    key={product.id}
                    href={`/productos/${product.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-4 rounded-lg border border-lc-border bg-lc-card p-3 transition-all hover:border-lc-gray-light hover:bg-lc-dark"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-lc-border bg-lc-dark">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={product.images?.[0]?.altText || product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-lc-purple-light">
                            {product.category?.name || "LilCake"}
                          </p>
                          <h3 className="mt-1 truncate text-base font-heading font-bold text-lc-white">
                            {product.name}
                          </h3>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-lc-white">
                            {formatCOP(product.price)}
                          </p>
                          {product.compareAtPrice ? (
                            <p className="text-xs text-lc-gray line-through decoration-lc-gray">
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-lc-white transition-colors hover:text-lc-purple-light"
          >
            {hasActiveQuery ? "Ver resultados completos" : "Explorar todo el catalogo"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </aside>
    </div>
  )
}
