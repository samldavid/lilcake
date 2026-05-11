import Link from "next/link"
import { notFound } from "next/navigation"
import { MessageCircle, PackageCheck, RotateCcw, ShieldCheck } from "lucide-react"
import { AddToCartBtn } from "@/components/storefront/AddToCartBtn"
import { ProductImageGallery } from "@/components/storefront/ProductImageGallery"
import { Badge } from "@/components/ui/Badge"
import { getProductBySlug } from "@/lib/storefront-data"
import { formatCOP } from "@/lib/utils"

export const revalidate = 60

const commerceNotes = [
  {
    title: "Pago seguro",
    text: "Wompi, PSE, Nequi y tarjetas con total claro antes de pagar.",
    icon: ShieldCheck,
    iconClassName: "text-lc-white",
  },
  {
    title: "Envio nacional",
    text: "Entrega estimada de 2 a 5 dias habiles en Colombia.",
    icon: PackageCheck,
    iconClassName: "text-lc-white",
  },
  {
    title: "Cambios",
    text: "Cambios y devoluciones segun politica dentro de los primeros 15 dias.",
    icon: RotateCcw,
    iconClassName: "text-lc-white",
  },
  {
    title: "Asesoria por WhatsApp",
    text: "Resuelve talla, disponibilidad o contraentrega antes de pagar.",
    icon: MessageCircle,
    iconClassName: "text-lc-success",
  },
]

function getCategoryFallback(categorySlug?: string) {
  if (categorySlug === "zapatos") {
    return "/images/zapatos.png"
  }

  if (categorySlug === "accesorios") {
    return "/images/accesorios.png"
  }

  return "/images/ropa.png"
}

function resolveDisplayImage(url: string | undefined, fallback: string) {
  if (!url) {
    return fallback
  }

  if (process.env.NODE_ENV !== "production" && url.startsWith("/uploads/")) {
    return fallback
  }

  return url
}

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

  const fallbackImage = getCategoryFallback(product.category?.slug)
  const displayImages = product.images.map((image) => ({
    ...image,
    url: resolveDisplayImage(image.url, fallbackImage),
  }))
  const mainImage =
    displayImages[0]?.url ||
    "https://placehold.co/800x1000/181818/C8C5BD?text=Sin+Imagen"
  const categoryHref = product.category?.slug
    ? `/productos?categoria=${product.category.slug}`
    : "/productos"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-lc-gray sm:mb-8 sm:text-sm">
        <Link href="/" className="hover:text-lc-white">
          Inicio
        </Link>
        <span>/</span>
        <Link href={categoryHref} className="hover:text-lc-white">
          {product.category?.name || "Catalogo"}
        </Link>
        <span>/</span>
        <span className="font-medium text-lc-white">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:gap-14">
        <ProductImageGallery
          images={displayImages}
          productName={product.name}
          discount={discount}
        />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {product.isFeatured ? <Badge variant="purple">Nuevo ingreso</Badge> : null}
            {discount > 0 ? <Badge variant="pink">-{discount}%</Badge> : null}
            <span className="rounded-md border border-lc-border px-2.5 py-1 text-xs font-semibold text-lc-gray-light">
              {product.category?.name || "LilCake"}
            </span>
          </div>

          <h1 className="text-3xl font-heading font-bold leading-tight text-lc-white sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-bold text-lc-white sm:text-4xl">
              {formatCOP(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="mb-1 text-lg text-lc-gray line-through decoration-lc-gray">
                {formatCOP(product.compareAtPrice)}
              </span>
            ) : null}
          </div>

          <p className="mt-6 max-w-2xl text-base leading-8 text-lc-gray-light">
            {product.description}
          </p>

          <div className="mt-8 rounded-lg border border-lc-border bg-lc-card p-4 sm:p-5">
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

          <div className="mt-6 grid gap-3">
            {commerceNotes.map((note) => {
              const Icon = note.icon

              return (
                <div
                  key={note.title}
                  className="flex gap-3 rounded-lg border border-lc-border bg-lc-darker p-4"
                >
                  <Icon size={19} className={`mt-0.5 shrink-0 ${note.iconClassName}`} />
                  <div>
                    <h2 className="text-sm font-bold text-lc-white">{note.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-lc-gray-light">
                      {note.text}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
