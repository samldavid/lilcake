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
    <div className="overflow-hidden">
      <HeroSection />

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

      <StorefrontExperienceSection />
    </div>
  )
}
