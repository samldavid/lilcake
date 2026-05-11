"use client"

import * as React from "react"
import Link from "next/link"
import { useDeferredValue } from "react"
import { Edit, Filter, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { AdminSearchInput } from "@/components/admin/AdminSearchInput"
import { scoreAdminSearchMatch } from "@/lib/admin-search"
import { formatCOP } from "@/lib/utils"

export type AdminProductRow = {
  id: string
  name: string
  price: number
  compareAtPrice: number | null
  isActive: boolean
  category: {
    name: string
  }
  variants: Array<{
    stock: number
  }>
  images: Array<{
    url: string
  }>
}

type AdminProductsTableProps = {
  products: AdminProductRow[]
  basePath?: string
  demoMode?: boolean
  demoNotice?: string
  onDemoDelete?: (productId: string) => void
}

export function AdminProductsTable({
  products,
  basePath = "/admin",
  demoMode = false,
  demoNotice = "Esto es una demo. Los cambios no se guardan.",
  onDemoDelete,
}: AdminProductsTableProps) {
  const [query, setQuery] = React.useState("")
  const [rows, setRows] = React.useState(products)
  const [feedback, setFeedback] = React.useState("")
  const deferredQuery = useDeferredValue(query)
  const activeQuery = deferredQuery.trim()

  React.useEffect(() => {
    setRows(products)
  }, [products])

  function removeProduct(productId: string) {
    if (!demoMode) {
      return
    }

    setRows((currentRows) =>
      currentRows.filter((currentProduct) => currentProduct.id !== productId)
    )
    onDemoDelete?.(productId)
    setFeedback(demoNotice)
  }

  const filteredProducts = activeQuery
    ? rows
        .map((product) => {
          const totalStock = product.variants.reduce(
            (acc, variant) => acc + variant.stock,
            0
          )
          const score = scoreAdminSearchMatch(activeQuery, [
            product.name,
            product.category.name,
            product.id,
            product.isActive ? "activo publicado" : "borrador inactivo",
            `${totalStock}`,
            `${product.variants.length} variantes`,
          ])

          return {
            product,
            totalStock,
            score,
          }
        })
        .filter((entry) => entry.score > 0)
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score
          }

          return left.product.name.localeCompare(right.product.name, "es", {
            sensitivity: "base",
          })
        })
    : rows.map((product) => ({
        product,
        totalStock: product.variants.reduce((acc, variant) => acc + variant.stock, 0),
        score: 1,
      }))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-lc-border bg-lc-card p-4 sm:p-5 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-3">
          <AdminSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por nombre, categoria, ID o estado..."
          />
          <p className="text-xs text-lc-gray">
            {query.trim()
              ? `${filteredProducts.length} coincidencias en tiempo real`
              : `${rows.length} productos cargados`}
          </p>
        </div>
        <Button
          variant="secondary"
          className="flex w-full items-center justify-center gap-2 px-4 lg:w-auto"
        >
          <Filter size={18} /> Filtrar
        </Button>
      </div>

      {feedback ? (
        <div className="rounded-2xl border border-lc-warning/30 bg-lc-warning/10 p-4 text-sm text-lc-warning">
          {feedback}
        </div>
      ) : null}

      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-lc-border bg-lc-card px-6 py-12 text-center text-lc-gray">
          {query.trim()
            ? `No encontramos productos que coincidan con "${query.trim()}".`
            : "No hay productos registrados. "}
          {!query.trim() ? (
            <Link
              href={`${basePath}/productos/nuevo`}
              className="font-semibold text-lc-purple hover:underline"
            >
              Empieza agregando uno.
            </Link>
          ) : null}
        </div>
      ) : null}

      {filteredProducts.length > 0 ? (
        <div className="grid gap-4 md:hidden">
          {filteredProducts.map(({ product, totalStock }) => {
            const mainImage =
              product.images[0]?.url ||
              "https://placehold.co/100x100/1A1A2E/8B8B9E?text=Img"

            return (
              <article
                key={product.id}
                className="rounded-2xl border border-lc-border bg-lc-card p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-lc-border bg-lc-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-bold text-lc-white">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-lc-gray">
                          {product.category.name}
                        </p>
                      </div>
                      {product.isActive ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="error" className="bg-lc-dark text-lc-gray">
                          Borrador
                        </Badge>
                      )}
                      {product.compareAtPrice ? (
                        <Badge variant="pink">Oferta</Badge>
                      ) : null}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-lc-border bg-lc-darker/60 p-3">
                        <p className="text-xs uppercase tracking-wide text-lc-gray">
                          Precio
                        </p>
                        <p className="mt-1 font-bold text-lc-white">
                          {formatCOP(product.price)}
                        </p>
                        {product.compareAtPrice ? (
                          <p className="mt-1 text-xs text-lc-gray line-through decoration-lc-pink">
                            {formatCOP(product.compareAtPrice)}
                          </p>
                        ) : null}
                      </div>
                      <div className="rounded-xl border border-lc-border bg-lc-darker/60 p-3">
                        <p className="text-xs uppercase tracking-wide text-lc-gray">
                          Stock
                        </p>
                        <p className="mt-1 font-bold text-lc-white">
                          {product.variants.length} var.
                        </p>
                        <p
                          className={`mt-1 text-xs font-semibold ${
                            totalStock > 10
                              ? "text-lc-success"
                              : totalStock > 0
                                ? "text-lc-warning"
                                : "text-lc-error"
                          }`}
                        >
                          {totalStock} disponibles
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`${basePath}/productos/${product.id}/editar`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-lc-cyan/20 bg-lc-cyan/10 px-4 py-2 text-sm font-semibold text-lc-cyan transition-colors hover:bg-lc-cyan/20"
                      >
                        <Edit size={16} />
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeProduct(product.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-lc-error/20 bg-lc-error/10 px-4 py-2 text-sm font-semibold text-lc-error transition-colors hover:bg-lc-error/20"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : null}

      {filteredProducts.length > 0 ? (
        <div className="hidden overflow-hidden rounded-2xl border border-lc-border bg-lc-card shadow-sm md:block">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full whitespace-nowrap text-left">
              <thead className="border-b border-lc-border bg-lc-darker">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    Variantes / Stock
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lc-border">
                {filteredProducts.map(({ product, totalStock }) => {
                  const mainImage =
                    product.images[0]?.url ||
                    "https://placehold.co/100x100/1A1A2E/8B8B9E?text=Img"

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-lc-dark/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-lc-border bg-lc-black">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={mainImage}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="max-w-xs truncate text-sm font-bold text-lc-white">
                              {product.name}
                            </div>
                            <div className="mt-0.5 text-xs text-lc-gray">
                              {product.category.name}
                            </div>
                            {product.compareAtPrice ? (
                              <div className="mt-1">
                                <Badge variant="pink">Oferta</Badge>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-bold text-lc-white">
                          {formatCOP(product.price)}
                        </div>
                        {product.compareAtPrice ? (
                          <div className="mt-0.5 text-xs text-lc-gray line-through decoration-lc-pink">
                            {formatCOP(product.compareAtPrice)}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm font-medium text-lc-white">
                          {product.variants.length} var.
                        </div>
                        <div
                          className={`mt-0.5 text-xs font-bold ${
                            totalStock > 10
                              ? "text-lc-success"
                              : totalStock > 0
                                ? "text-lc-warning"
                                : "text-lc-error"
                          }`}
                        >
                          {totalStock} en stock
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.isActive ? (
                          <Badge variant="success">Activo</Badge>
                        ) : (
                          <Badge variant="error" className="bg-lc-dark text-lc-gray">
                            Borrador
                          </Badge>
                        )}
                      </td>
                      <td className="space-x-2 px-6 py-4 text-right">
                        <Link href={`${basePath}/productos/${product.id}/editar`}>
                          <button
                            className="rounded-lg p-2 text-lc-gray transition-colors hover:bg-lc-cyan/10 hover:text-lc-cyan"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                        </Link>
                        <button
                          className="rounded-lg p-2 text-lc-gray transition-colors hover:bg-lc-error/10 hover:text-lc-error"
                          title="Eliminar"
                          type="button"
                          onClick={() => removeProduct(product.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
