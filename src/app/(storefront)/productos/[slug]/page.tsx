import Link from "next/link"
import { notFound } from "next/navigation"
import { AddToCartBtn } from "@/components/storefront/AddToCartBtn"
import { ProductImageGallery } from "@/components/storefront/ProductImageGallery"
import { Badge } from "@/components/ui/Badge"
import { getProductBySlug } from "@/lib/storefront-data"
import { formatCOP } from "@/lib/utils"

export const revalidate = 60

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      )
    : 0

  const mainImage =
    product.images[0]?.url ||
    "https://placehold.co/800x1000/1A1A2E/8B8B9E?text=Sin+Imagen"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-lc-gray sm:mb-8 sm:text-sm">
        <Link href="/" className="hover:text-lc-white">
          Inicio
        </Link>
        <span>/</span>
        <Link
          href={`/productos?categoria=${product.category?.slug}`}
          className="hover:text-lc-white"
        >
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="font-medium text-lc-white">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
        <ProductImageGallery
          images={product.images}
          productName={product.name}
          discount={discount}
        />

        <div className="flex flex-col">
          {product.isFeatured && (
            <div className="mb-3 sm:mb-4">
              <Badge variant="purple">DROP EXCLUSIVO</Badge>
            </div>
          )}

          <h1 className="mb-4 text-2xl font-heading font-bold leading-tight text-lc-white sm:text-4xl lg:text-5xl">
            {product.name}
          </h1>

          <div className="mb-6 flex flex-wrap items-end gap-3 sm:mb-8 sm:gap-4">
            <span className="bg-gradient-to-r from-lc-white to-lc-gray-light bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              {formatCOP(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="mb-1 text-lg text-lc-gray line-through decoration-lc-pink sm:text-xl">
                {formatCOP(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="prose prose-invert prose-p:text-lc-gray-light mb-8 max-w-none sm:mb-10">
            <p>{product.description}</p>
          </div>

          <div className="mb-8 rounded-2xl border border-lc-border bg-lc-darker p-4 sm:mb-10 sm:p-6">
            <AddToCartBtn
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: mainImage,
              }}
              variants={product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                color: v.color,
                stock: v.stock,
              }))}
            />
          </div>

          <div className="mt-auto border-t border-lc-border pt-5 sm:pt-6">
            <h4 className="mb-3 font-heading font-bold text-lc-white sm:mb-4">
              Envios y Devoluciones
            </h4>
            <p className="mb-2 text-sm text-lc-gray">
              Envio estandar: 2 a 5 dias habiles en Colombia.
            </p>
            <p className="text-sm text-lc-gray">
              Devoluciones gratis dentro de los primeros 15 dias tras haber
              recibido tu pedido.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
