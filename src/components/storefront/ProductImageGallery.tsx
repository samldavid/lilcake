"use client"

import * as React from "react"
import { Badge } from "@/components/ui/Badge"

type ProductImageGalleryProps = {
  images: Array<{
    id: string
    url: string
    altText: string | null
  }>
  productName: string
  discount: number
}

const fallbackImage = {
  id: "fallback",
  url: "https://placehold.co/800x1000/181818/C8C5BD?text=Sin+Imagen",
  altText: "Sin imagen",
}

export function ProductImageGallery({
  images,
  productName,
  discount,
}: ProductImageGalleryProps) {
  const galleryImages = images.length > 0 ? images : [fallbackImage]
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)
  const [isZoomed, setIsZoomed] = React.useState(false)
  const [zoomOrigin, setZoomOrigin] = React.useState("50% 50%")

  React.useEffect(() => {
    if (selectedImageIndex >= galleryImages.length) {
      setSelectedImageIndex(0)
    }
  }, [galleryImages.length, selectedImageIndex])

  const selectedImage = galleryImages[selectedImageIndex] || fallbackImage

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomOrigin(`${x}% ${y}%`)
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div
        className="relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-lg border border-lc-border bg-lc-dark sm:aspect-[5/6] md:h-[620px] md:aspect-auto"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => {
          setIsZoomed(false)
          setZoomOrigin("50% 50%")
        }}
        onMouseMove={handleMouseMove}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={selectedImage.url}
          alt={selectedImage.altText || productName}
          className={`h-full w-full object-cover text-transparent transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100"}`}
          style={{ transformOrigin: zoomOrigin }}
        />
        {discount > 0 && (
          <Badge
            variant="pink"
            className="absolute left-3 top-3 px-2.5 py-1 text-sm sm:left-4 sm:top-4 sm:px-3 sm:text-base"
          >
            -{discount}%
          </Badge>
        )}
        <div className="absolute bottom-4 right-4 hidden rounded-md bg-lc-black/72 px-3 py-1.5 text-xs font-semibold text-lc-white backdrop-blur-md md:block">
          Zoom al pasar
        </div>
      </div>

      {galleryImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className={`h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-[8px] border bg-lc-dark transition-all md:aspect-square md:h-auto md:w-auto ${selectedImageIndex === index ? "border-lc-white" : "border-lc-border hover:border-lc-gray-light"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.altText || `${productName} ${index + 1}`}
                className="h-full w-full object-cover text-transparent transition-transform duration-300 hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
