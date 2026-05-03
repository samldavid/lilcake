import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { HeroSection } from "@/components/storefront/HeroSection"
import {
  ProductCard,
  type ProductCardProduct,
} from "@/components/storefront/ProductCard"
import { ScrollReveal } from "@/components/storefront/ScrollReveal"
import { StorefrontExperienceSection } from "@/components/storefront/StorefrontExperienceSection"
import { getFeaturedProducts } from "@/lib/storefront-data"

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
    ],
    category: { name: "Accesorios" },
    isFeatured: false,
  },
]

export default async function HomePage() {
  let featuredProducts: ProductCardProduct[] = []

  try {
    featuredProducts = await getFeaturedProducts()
  } catch (error) {
    console.error("Error fetching products:", error)
  }

  const productsToDisplay =
    featuredProducts.length > 0 ? featuredProducts : dummyProducts

  return (
    <div className="animate-fade-in overflow-hidden">
      <HeroSection />

      <section className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-lc-purple/10 blur-[90px]" />
        <ScrollReveal className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-lc-purple-light">
              Drop activo
            </p>
            <h2 className="mb-2 text-2xl font-heading font-bold text-lc-white sm:text-4xl">
              Nuevos Lanzamientos
            </h2>
            <p className="max-w-2xl text-sm text-lc-gray-light sm:text-base">
              Lo mas fresh de la temporada. Ediciones limitadas, outfits urbanos
              y piezas listas para rotar tu estilo.
            </p>
          </div>
          <Link
            href="/productos"
            className="group flex items-center text-sm font-semibold text-lc-purple transition-colors hover:text-lc-purple-light"
          >
            Ver todo el catalogo
            <ArrowRight
              size={16}
              className="ml-2 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {productsToDisplay.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 90}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="relative border-y border-lc-border bg-lc-darker/50 py-14 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent,rgba(108,60,225,0.08),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-lc-gray">
              Navega a tu manera
            </p>
            <h2 className="mb-8 text-2xl font-heading font-bold text-lc-white sm:mb-12 sm:text-4xl">
              Explora por Categoria
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3 md:gap-8">
            {[
              { title: "Ropa", slug: "ropa", img: "/images/ropa.png" },
              { title: "Zapatos", slug: "zapatos", img: "/images/zapatos.png" },
              { title: "Accesorios", slug: "accesorios", img: "/images/accesorios.png" },
            ].map((cat, index) => (
              <ScrollReveal key={cat.slug} delay={index * 120}>
                <Link
                  href={`/productos?categoria=${cat.slug}`}
                  className="group category-card relative block h-52 overflow-hidden rounded-3xl border border-lc-border sm:h-64 md:h-80"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-lc-black/75 via-lc-black/10 to-transparent" />
                  <div className="absolute inset-x-6 bottom-6 text-left">
                    <span className="mb-3 inline-flex rounded-full border border-white/15 bg-lc-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-lc-gray-light backdrop-blur-md">
                      Categoria 0{index + 1}
                    </span>
                    <h3 className="text-2xl font-heading font-bold uppercase tracking-[0.22em] text-white transition-transform duration-300 drop-shadow-2xl group-hover:translate-x-2 sm:text-3xl">
                      {cat.title}
                    </h3>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <StorefrontExperienceSection />
    </div>
  )
}
