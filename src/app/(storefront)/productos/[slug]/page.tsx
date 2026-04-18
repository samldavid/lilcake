import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatCOP } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import { AddToCartBtn } from "@/components/storefront/AddToCartBtn"
import { ProductImageGallery } from "@/components/storefront/ProductImageGallery"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug: slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      category: true,
    }
  })

  if (!product || !product.isActive) {
    notFound()
  }

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const mainImage = product.images[0]?.url || "https://placehold.co/800x1000/1A1A2E/8B8B9E?text=Sin+Imagen"
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-sm breadcrumbs mb-8 text-lc-gray">
        <Link href="/" className="hover:text-lc-white">Inicio</Link>
        <span className="mx-2">/</span>
        <Link href={`/productos?categoria=${product.category?.slug}`} className="hover:text-lc-white">{product.category?.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-lc-white font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Images section */}
        <ProductImageGallery
          images={product.images}
          productName={product.name}
          discount={discount}
        />

        {/* Product Info */}
        <div className="flex flex-col">
          {product.isFeatured && (
            <div className="mb-4">
              <Badge variant="purple">DROP EXCLUSIVO</Badge>
            </div>
          )}
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-lc-white mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-end gap-4 mb-8">
            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lc-white to-lc-gray-light">
              {formatCOP(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xl text-lc-gray line-through decoration-lc-pink mb-1">
                {formatCOP(product.compareAtPrice)}
              </span>
            )}
          </div>
          
          <div className="prose prose-invert prose-p:text-lc-gray-light max-w-none mb-10">
            <p>{product.description}</p>
          </div>

          <div className="mb-10 bg-lc-darker p-6 rounded-2xl border border-lc-border">
            <AddToCartBtn 
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: mainImage
              }}
              variants={product.variants.map(v => ({
                id: v.id,
                size: v.size,
                color: v.color,
                stock: v.stock
              }))}
            />
          </div>

          {/* Details toggle (Accordion pattern placeholder) */}
          <div className="border-t border-lc-border pt-6 mt-auto">
            <h4 className="font-heading font-bold text-lc-white mb-4">Envíos y Devoluciones</h4>
            <p className="text-sm text-lc-gray mb-2">Envío estándar: 2 a 5 días hábiles en Colombia.</p>
            <p className="text-sm text-lc-gray">Devoluciones gratis dentro de los primeros 15 días tras haber recibido tu pedido.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
