import {
  ArrowRight,
  CreditCard,
  MessageCircle,
  Tags,
  Truck,
} from "lucide-react"
import Link from "next/link"
import { HeroSection } from "@/components/storefront/HeroSection"
import {
  ProductCard,
  type ProductCardProduct,
} from "@/components/storefront/ProductCard"
import { ScrollReveal } from "@/components/storefront/ScrollReveal"
import { StorefrontExperienceSection } from "@/components/storefront/StorefrontExperienceSection"
import { getFeaturedProducts, getSaleProducts } from "@/lib/storefront-data"

export const revalidate = 60

const dummyProducts: ProductCardProduct[] = [
  {
    id: "1",
    name: "Hoodie Essential Oversize - Black",
    slug: "hoodie-essential-oversize-black",
    price: 120000,
    compareAtPrice: 150000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop",
        altText: "Hoodie",
      },
      {
        url: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800&auto=format&fit=crop",
        altText: "Hoodie urbano en segundo angulo",
      },
    ],
    category: { name: "Ropa" },
    isFeatured: true,
  },
  {
    id: "2",
    name: "Sneakers LC Pro - White/Purple",
    slug: "sneakers-lc-pro-white-purple",
    price: 280000,
    compareAtPrice: null,
    images: [
      {
        url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop",
        altText: "Sneakers",
      },
      {
        url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop",
        altText: "Sneakers en segundo angulo",
      },
    ],
    category: { name: "Zapatos" },
    isFeatured: false,
  },
  {
    id: "3",
    name: "Rinonera Urban Tech - Jet Black",
    slug: "rinonera-urban-tech-jet-black",
    price: 85000,
    compareAtPrice: 95000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop",
        altText: "Rinonera",
      },
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
        altText: "Accesorio urbano en segundo angulo",
      },
    ],
    category: { name: "Accesorios" },
    isFeatured: true,
  },
  {
    id: "4",
    name: "Gorra Snapback Logo - Pink",
    slug: "gorra-snapback-logo-pink",
    price: 45000,
    compareAtPrice: null,
    images: [
      {
        url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop",
        altText: "Gorra",
      },
      {
        url: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&auto=format&fit=crop",
        altText: "Gorra en segundo angulo",
      },
    ],
    category: { name: "Accesorios" },
    isFeatured: false,
  },
]

const categories = [
  {
    title: "Ropa",
    slug: "ropa",
    img: "/images/ropa.png",
    description: "Prendas con silueta urbana y rotacion diaria.",
  },
  {
    title: "Zapatos",
    slug: "zapatos",
    img: "/images/zapatos.png",
    description: "Sneakers para completar el look sin sobrecargarlo.",
  },
  {
    title: "Accesorios",
    slug: "accesorios",
    img: "/images/accesorios.png",
    description: "Detalles que elevan el outfit sin competir con el look.",
  },
]

const commerceHighlights = [
  {
    title: "Pagos locales",
    text: "Wompi, PSE, Nequi, tarjetas y opciones asistidas.",
    icon: CreditCard,
  },
  {
    title: "Envios nacionales",
    text: "Despachos en Colombia con seguimiento del pedido.",
    icon: Truck,
  },
  {
    title: "Soporte cercano",
    text: "Asesoria por WhatsApp para talla, disponibilidad o pago.",
    icon: MessageCircle,
  },
]

export default async function HomePage() {
  let featuredProducts: ProductCardProduct[] = []
  let saleProducts: ProductCardProduct[] = []

  try {
    const [featuredResult, saleResult] = await Promise.all([
      getFeaturedProducts(),
      getSaleProducts(),
    ])
    featuredProducts = featuredResult
    saleProducts = saleResult
  } catch (error) {
    console.error("Error fetching products:", error)
  }

  const productsToDisplay =
    featuredProducts.length > 0 ? featuredProducts : dummyProducts
  const saleProductsToDisplay =
    saleProducts.length > 0
      ? saleProducts
      : productsToDisplay.filter((product) => product.compareAtPrice).slice(0, 4)

  return (
    <div className="overflow-hidden">
      <HeroSection />

      <section className="border-b border-lc-border bg-lc-darker/80">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:px-6 md:grid-cols-3 lg:px-8">
          {commerceHighlights.map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-lg border border-white/10 bg-lc-black/35 p-4"
              >
                <Icon size={20} className="mt-0.5 shrink-0 text-lc-purple-light" />
                <div>
                  <h2 className="text-sm font-bold text-lc-white">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-lc-gray-light">
                    {item.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <ScrollReveal className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold text-lc-purple-light">
              Nuevos ingresos
            </p>
            <h2 className="text-3xl font-heading font-bold text-lc-white sm:text-4xl">
              Piezas listas para salir
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-lc-gray-light sm:text-base">
              Una seleccion corta para comprar rapido: fotos claras, precio al
              frente y categorias faciles de recorrer.
            </p>
          </div>
          <Link
            href="/productos"
            className="group inline-flex items-center text-sm font-semibold text-lc-white transition-colors hover:text-lc-purple-light"
          >
            Ver todo el catalogo
            <ArrowRight
              size={16}
              className="ml-2 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {productsToDisplay.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 70}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {saleProductsToDisplay.length > 0 ? (
        <section className="border-y border-lc-border bg-lc-black py-14 sm:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-lc-pink">
                  <Tags size={16} />
                  Ofertas y ultimas tallas
                </p>
                <h2 className="text-3xl font-heading font-bold text-lc-white sm:text-4xl">
                  Piezas con precio especial
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-lc-gray-light sm:text-base">
                  Productos con precio anterior visible, descuentos claros y stock
                  limitado cuando aplica.
                </p>
              </div>
              <Link
                href="/productos"
                className="group inline-flex items-center text-sm font-semibold text-lc-white transition-colors hover:text-lc-pink"
              >
                Ver ofertas en catalogo
                <ArrowRight
                  size={16}
                  className="ml-2 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </ScrollReveal>

            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {saleProductsToDisplay.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 70}>
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y border-lc-border bg-lc-darker py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold text-lc-gray-light">
                Compra por categoria
              </p>
              <h2 className="text-3xl font-heading font-bold text-lc-white sm:text-4xl">
                Encuentra el punto de partida
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {categories.map((cat, index) => (
              <ScrollReveal key={cat.slug} delay={index * 90}>
                <Link
                  href={`/productos?categoria=${cat.slug}`}
                  className="group category-card relative block overflow-hidden rounded-lg border border-lc-border bg-lc-card"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-lc-dark">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cat.img}
                      alt={cat.title}
                      className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.025] group-hover:opacity-100"
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-xl font-heading font-bold text-lc-white">
                        {cat.title}
                      </h3>
                      <ArrowRight
                        size={18}
                        className="text-lc-gray transition-transform group-hover:translate-x-0.5 group-hover:text-lc-white"
                      />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-lc-gray-light">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <StorefrontExperienceSection products={productsToDisplay} />
    </div>
  )
}
