"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  ProductCard,
  type ProductCardProduct,
} from "@/components/storefront/ProductCard"
import { cn } from "@/lib/utils"

type SaleProductCarouselProps = {
  products: ProductCardProduct[]
}

export function SaleProductCarousel({ products }: SaleProductCarouselProps) {
  const railRef = React.useRef<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  const scrollToProduct = React.useCallback(
    (nextIndex: number) => {
      const rail = railRef.current
      if (!rail || products.length === 0) return

      const normalizedIndex = (nextIndex + products.length) % products.length
      const card = rail.querySelector<HTMLElement>(
        `[data-sale-index="${normalizedIndex}"]`
      )

      if (card) {
        rail.scrollTo({
          left: card.offsetLeft - rail.offsetLeft,
          behavior: "smooth",
        })
      }

      setActiveIndex(normalizedIndex)
    },
    [products.length]
  )

  React.useEffect(() => {
    if (isPaused || products.length < 2) return

    const timer = window.setInterval(() => {
      scrollToProduct(activeIndex + 1)
    }, 4400)

    return () => window.clearInterval(timer)
  }, [activeIndex, isPaused, products.length, scrollToProduct])

  React.useEffect(() => {
    if (!railRef.current) return
    const rail = railRef.current

    function updateFromScroll() {
      const cards = Array.from(
        rail.querySelectorAll<HTMLElement>("[data-sale-index]")
      )
      const closest = cards.reduce(
        (current, card) => {
          const distance = Math.abs(card.offsetLeft - rail.scrollLeft)

          return distance < current.distance
            ? {
                index: Number(card.dataset.saleIndex || 0),
                distance,
              }
            : current
        },
        { index: 0, distance: Number.POSITIVE_INFINITY }
      )

      setActiveIndex(closest.index)
    }

    rail.addEventListener("scroll", updateFromScroll, { passive: true })
    return () => rail.removeEventListener("scroll", updateFromScroll)
  }, [])

  if (products.length === 0) {
    return null
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={railRef}
        className="flex snap-x gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            data-sale-index={index}
            className="w-[78vw] shrink-0 snap-start sm:w-[320px] lg:w-[300px] xl:w-[310px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {products.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => scrollToProduct(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex
                  ? "w-9 bg-lc-pink"
                  : "w-4 bg-lc-border hover:bg-lc-gray-light"
              )}
              aria-label={`Ver oferta ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollToProduct(activeIndex - 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-lc-border text-lc-white transition-colors hover:border-lc-pink hover:text-lc-pink"
            aria-label="Oferta anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scrollToProduct(activeIndex + 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-lc-border text-lc-white transition-colors hover:border-lc-pink hover:text-lc-pink"
            aria-label="Oferta siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
