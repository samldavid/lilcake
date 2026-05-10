"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { formatCOP } from "@/lib/utils"

export type HeroCarouselProduct = {
  id: string
  name: string
  slug: string
  price: number
  images: { url: string; altText: string | null }[]
  category?: { name: string }
}

type HeroProductCarouselProps = {
  products: HeroCarouselProduct[]
}

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

function getProductImage(product: HeroCarouselProduct) {
  return product.images?.[0]?.url || getCategoryFallback(product.category?.name)
}

export function HeroProductCarousel({ products }: HeroProductCarouselProps) {
  const showcaseProducts = React.useMemo(
    () => products.filter((product) => product.images.length > 0).slice(0, 5),
    [products]
  )
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  React.useEffect(() => {
    if (isPaused || showcaseProducts.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % showcaseProducts.length)
    }, 4200)

    return () => window.clearInterval(timer)
  }, [isPaused, showcaseProducts.length])

  if (showcaseProducts.length === 0) {
    return null
  }

  const activeProduct = showcaseProducts[activeIndex]
  const activeImage = getProductImage(activeProduct)

  function goToPrevious() {
    setActiveIndex(
      (currentIndex) =>
        (currentIndex - 1 + showcaseProducts.length) % showcaseProducts.length
    )
  }

  function goToNext() {
    setActiveIndex((currentIndex) => (currentIndex + 1) % showcaseProducts.length)
  }

  return (
    <div
      className="w-full max-w-[420px] justify-self-end"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden rounded-lg border border-white/12 bg-lc-black/58 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-lc-gray-light">
            <Sparkles size={15} className="text-lc-purple-light" />
            Drop activo
          </div>
          <div className="text-xs font-semibold text-lc-gray">
            {activeIndex + 1}/{showcaseProducts.length}
          </div>
        </div>

        <Link
          href={`/productos/${activeProduct.slug}`}
          className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lc-purple-light"
          aria-label={`Ver ${activeProduct.name}`}
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-lc-dark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeProduct.id}
              src={activeImage}
              alt={activeProduct.images?.[0]?.altText || activeProduct.name}
              className="h-full w-full object-cover object-center text-transparent transition duration-700 group-hover:scale-[1.025]"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-lc-black via-lc-black/55 to-transparent p-4">
              <p className="text-xs font-semibold text-lc-purple-light">
                {activeProduct.category?.name || "LilCake"}
              </p>
              <h2 className="mt-1 line-clamp-2 text-xl font-heading font-bold leading-6 text-lc-white">
                {activeProduct.name}
              </h2>
              <p className="mt-2 text-lg font-bold text-lc-white">
                {formatCOP(activeProduct.price)}
              </p>
            </div>
          </div>
        </Link>

        <div className="flex items-center justify-between gap-3 p-3">
          <button
            type="button"
            onClick={goToPrevious}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/12 text-lc-white transition-colors hover:border-lc-purple-light hover:bg-lc-purple/18"
            aria-label="Producto anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex min-w-0 flex-1 justify-center gap-2">
            {showcaseProducts.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-8 bg-gradient-to-r from-lc-purple to-lc-pink"
                    : "w-2.5 bg-white/28 hover:bg-white/50"
                }`}
                aria-label={`Ver producto ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNext}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/12 text-lc-white transition-colors hover:border-lc-purple-light hover:bg-lc-purple/18"
            aria-label="Producto siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
