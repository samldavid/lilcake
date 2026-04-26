import Link from "next/link"
import { Badge } from "@/components/ui/Badge"
import { formatCOP } from "@/lib/utils"

export interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice: number | null
    images: { url: string; altText: string | null }[]
    category?: { name: string }
    isFeatured?: boolean
  }
}

export type ProductCardProduct = ProductCardProps["product"]

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.url || "https://placehold.co/400x500/1A1A2E/8B8B9E?text=Sin+Imagen"
  const secondaryImageUrl = product.images?.[1]?.url
  
  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <div className="group card flex h-full flex-col overflow-hidden bg-lc-card">
      <Link
        href={`/productos/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-lc-dark sm:aspect-[10/13] lg:aspect-[4/5]"
      >
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5 sm:left-4 sm:top-4 sm:gap-2">
          {product.isFeatured && (
            <Badge variant="purple" className="px-2 py-1 text-[10px] shadow-lg backdrop-blur-md sm:px-3 sm:text-xs">
              NUEVO
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="pink" className="px-2 py-1 text-[10px] shadow-lg backdrop-blur-md sm:px-3 sm:text-xs">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imageUrl} 
          alt={product.images?.[0]?.altText || product.name}
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-in-out ${secondaryImageUrl ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"}`}
        />
        {secondaryImageUrl && (
          <img
            src={secondaryImageUrl}
            alt={product.images?.[1]?.altText || product.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-in-out"
          />
        )}

        {product.images.length > 1 && (
          <div className="absolute right-3 top-3 z-10 rounded-full bg-lc-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-lc-white backdrop-blur-md sm:right-4 sm:top-4 sm:px-3 sm:text-[11px]">
            {product.images.length} fotos
          </div>
        )}
        
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-4 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
          <div className="bg-lc-black/70 backdrop-blur-md text-whitetext-sm font-bold text-center py-3 rounded-xl border border-white/10 uppercase tracking-wider text-lc-white hover:bg-lc-purple transition-colors">
            Ver Detalles
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="mb-2 flex items-start gap-2 sm:gap-3">
          <Link href={`/productos/${product.slug}`} className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-lc-white transition-colors group-hover:text-lc-purple sm:text-base lg:line-clamp-1 lg:text-lg">
              {product.name}
            </h3>
          </Link>
          <div className="shrink-0 text-right">
            <span className="block text-sm font-bold text-lc-white sm:text-base">
              {formatCOP(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-[10px] text-lc-gray line-through decoration-lc-pink sm:text-xs">
                {formatCOP(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
        <p className="mt-auto text-[11px] text-lc-gray sm:text-sm">
          {product.category?.name || "Ropa Urbana"}
        </p>
      </div>
    </div>
  )
}
