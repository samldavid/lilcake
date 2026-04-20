"use client"

import * as React from "react"
import Link from "next/link"
import { useDeferredValue } from "react"
import { Edit, Filter, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { formatCOP } from "@/lib/utils"
import { scoreAdminSearchMatch } from "@/lib/admin-search"
import { AdminSearchInput } from "@/components/admin/AdminSearchInput"

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
}

export function AdminProductsTable({ products }: AdminProductsTableProps) {
  const [query, setQuery] = React.useState("")
  const deferredQuery = useDeferredValue(query)
  const activeQuery = deferredQuery.trim()

  const filteredProducts = activeQuery
    ? products
        .map((product) => {
          const totalStock = product.variants.reduce((acc, variant) => acc + variant.stock, 0)
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
    : products.map((product) => ({
        product,
        totalStock: product.variants.reduce((acc, variant) => acc + variant.stock, 0),
        score: 1,
      }))

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 bg-lc-card p-4 rounded-2xl border border-lc-border">
        <div className="flex-1 space-y-3">
          <AdminSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por nombre, categoría, ID o estado..."
          />
          <p className="text-xs text-lc-gray">
            {query.trim()
              ? `${filteredProducts.length} coincidencias en tiempo real`
              : `${products.length} productos cargados`}
          </p>
        </div>
        <Button variant="secondary" className="flex items-center gap-2 px-4 whitespace-nowrap">
          <Filter size={18} /> Filtrar
        </Button>
      </div>

      <div className="bg-lc-card rounded-2xl shadow-sm border border-lc-border overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-lc-darker border-b border-lc-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider">Producto</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-right">Precio</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-center">Variantes / Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-center">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold text-lc-gray uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lc-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-lc-gray">
                    {query.trim()
                      ? `No encontramos productos que coincidan con "${query.trim()}".`
                      : "No hay productos registrados."}{" "}
                    {!query.trim() ? (
                      <Link href="/admin/productos/nuevo" className="text-lc-purple hover:underline">
                        Empieza agregando uno.
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ) : filteredProducts.map(({ product, totalStock }) => {
                const mainImage = product.images[0]?.url || "https://placehold.co/100x100/1A1A2E/8B8B9E?text=Img"

                return (
                  <tr key={product.id} className="hover:bg-lc-dark/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-lc-black overflow-hidden border border-lc-border shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-lc-white text-sm max-w-xs truncate">{product.name}</div>
                          <div className="text-xs text-lc-gray mt-0.5">{product.category.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-bold text-lc-white">{formatCOP(product.price)}</div>
                      {product.compareAtPrice ? (
                        <div className="text-xs text-lc-gray line-through decoration-lc-pink mt-0.5">
                          {formatCOP(product.compareAtPrice)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-lc-white font-medium">{product.variants.length} var.</div>
                      <div className={`text-xs mt-0.5 font-bold ${totalStock > 10 ? "text-lc-success" : totalStock > 0 ? "text-lc-warning" : "text-lc-error"}`}>
                        {totalStock} en stock
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.isActive ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="error" className="bg-lc-dark text-lc-gray">Borrador</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/productos/${product.id}/editar`}>
                        <button className="text-lc-gray hover:text-lc-cyan p-2 rounded-lg hover:bg-lc-cyan/10 transition-colors" title="Editar">
                          <Edit size={18} />
                        </button>
                      </Link>
                      <button className="text-lc-gray hover:text-lc-error p-2 rounded-lg hover:bg-lc-error/10 transition-colors" title="Eliminar">
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
    </>
  )
}
