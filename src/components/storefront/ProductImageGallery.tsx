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
  url: "https://placehold.co/800x1000/1A1A2E/8B8B9E?text=Sin+Imagen",
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
    <div className="space-y-4">
      <div
        className="bg-lc-dark rounded-3xl overflow-hidden border border-lc-border relative aspect-[4/5] md:aspect-auto md:h-[600px]"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => {
          setIsZoomed(false)
          setZoomOrigin("50% 50%")
        }}
        onMouseMove={handleMouseMove}
      >
        <img
          src={selectedImage.url}
          alt={selectedImage.altText || productName}
          className={`w-full h-full object-cover transition-transform duration-300 ${isZoomed ? "scale-150" : "scale-100"}`}
          style={{ transformOrigin: zoomOrigin }}
        />
        {discount > 0 && (
          <Badge
            variant="pink"
            className="absolute top-4 left-4 text-base px-3 py-1 shadow-lg backdrop-blur-md"
          >
            -{discount}% OFF
          </Badge>
        )}
        <div className="absolute bottom-4 right-4 rounded-full bg-lc-black/70 px-3 py-1 text-xs font-semibold text-lc-white backdrop-blur-md">
          Pasa el mouse para zoom
        </div>
      </div>

      {galleryImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImageIndex(index)}
              className={`bg-lc-dark rounded-xl overflow-hidden border aspect-square cursor-pointer transition-all ${selectedImageIndex === index ? "border-lc-purple shadow-[0_0_0_1px_rgba(108,60,225,0.35)]" : "border-lc-border hover:border-lc-purple/60"}`}
            >
              <img
                src={image.url}
                alt={image.altText || `${productName} ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
