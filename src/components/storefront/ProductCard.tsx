import Link from "next/link"
import { ArrowRight } from "lucide-react"
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

function getCategoryFallback(categoryName?: string) {
  const normalizedCategory = categoryName?.toLowerCase() || ""

  if (normalizedCategory.includes("zapato")) {
    return "/images/zapatos.png"
  }

  if (normalizedCategory.includes("accesorio")) {
    return "/images/accesorios.png"
  }

  return "/images/ropa.png"
}

function resolveDisplayImage(url: string | undefined, fallback: string) {
  if (!url) {
    return fallback
  }

  return url
}

export function ProductCard({ product }: ProductCardProps) {
  const fallbackImage = getCategoryFallback(product.category?.name)
  const imageUrl =
    resolveDisplayImage(product.images?.[0]?.url, fallbackImage) ||
    "https://placehold.co/400x500/181818/C8C5BD?text=Sin+Imagen"
  const secondaryImageUrl = resolveDisplayImage(product.images?.[1]?.url, "")
  const hasSecondaryImage = Boolean(secondaryImageUrl && secondaryImageUrl !== imageUrl)

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-lc-border bg-lc-card transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.18] hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
      <Link
        href={`/productos/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-lc-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lc-white/70"
        aria-label={`Ver ${product.name}`}
      >
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          {product.isFeatured ? (
            <Badge variant="purple" className="text-[10px]">
              Nuevo
            </Badge>
          ) : null}
          {discount > 0 ? (
            <Badge variant="pink" className="text-[10px]">
              -{discount}%
            </Badge>
          ) : null}
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={product.images?.[0]?.altText || product.name}
          className={`h-full w-full object-cover object-center text-transparent transition duration-700 ease-out ${
            hasSecondaryImage
              ? "group-hover:scale-[1.015] group-hover:opacity-0 group-focus-within:scale-[1.015] group-focus-within:opacity-0"
              : "group-hover:scale-[1.025] group-focus-within:scale-[1.025]"
          }`}
        />
        {hasSecondaryImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={secondaryImageUrl}
            alt={product.images?.[1]?.altText || product.name}
            className="absolute inset-0 h-full w-full scale-[1.015] object-cover object-center text-transparent opacity-0 transition duration-700 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
          />
        ) : null}

        <div className="absolute inset-x-0 bottom-0 hidden translate-y-2 bg-gradient-to-t from-lc-black/80 to-transparent p-3 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
          <span className="inline-flex items-center gap-2 rounded-md bg-lc-white px-3 py-2 text-xs font-bold text-lc-black">
            Ver producto <ArrowRight size={14} />
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="min-w-0">
          <p className="mb-1 text-xs text-lc-gray">
            {product.category?.name || "LilCake"}
          </p>
          <Link href={`/productos/${product.slug}`} className="block">
            <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-lc-white transition-colors group-hover:text-lc-gray-light sm:text-base sm:leading-6">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <span className="block text-sm font-bold text-lc-white sm:text-base">
              {formatCOP(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-xs text-lc-gray line-through decoration-lc-gray">
                {formatCOP(product.compareAtPrice)}
              </span>
            ) : null}
          </div>

          {product.images.length > 1 ? (
            <span className="rounded-md border border-lc-border px-2 py-1 text-[10px] font-semibold text-lc-gray">
              {product.images.length} fotos
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
