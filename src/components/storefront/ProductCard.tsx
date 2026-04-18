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
    <div className="group card flex flex-col h-full bg-lc-card overflow-hidden">
      {/* Image Container */}
      <Link href={`/productos/${product.slug}`} className="relative aspect-[4/5] block overflow-hidden bg-lc-dark">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.isFeatured && (
            <Badge variant="purple" className="shadow-lg backdrop-blur-md">NUEVO</Badge>
          )}
          {discount > 0 && (
            <Badge variant="pink" className="shadow-lg backdrop-blur-md">-{discount}%</Badge>
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
          <div className="absolute top-4 right-4 z-10 rounded-full bg-lc-black/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-lc-white backdrop-blur-md">
            {product.images.length} fotos
          </div>
        )}
        
        {/* Quick View Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <div className="bg-lc-black/70 backdrop-blur-md text-whitetext-sm font-bold text-center py-3 rounded-xl border border-white/10 uppercase tracking-wider text-lc-white hover:bg-lc-purple transition-colors">
            Ver Detalles
          </div>
        </div>
      </Link>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link href={`/productos/${product.slug}`}>
            <h3 className="font-heading font-bold text-lg text-lc-white group-hover:text-lc-purple transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="text-right shrink-0">
            <span className="font-bold text-lc-white block">
              {formatCOP(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-lc-gray line-through decoration-lc-pink">
                {formatCOP(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-lc-gray mt-auto">
          {product.category?.name || "Ropa Urbana"}
        </p>
      </div>
    </div>
  )
}
