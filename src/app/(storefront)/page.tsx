import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { HeroSection } from "@/components/storefront/HeroSection"
import {
  ProductCard,
  type ProductCardProduct,
} from "@/components/storefront/ProductCard"
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
    <div className="animate-fade-in">
      <HeroSection />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-heading font-bold text-lc-white sm:text-4xl">
              Nuevos Lanzamientos
            </h2>
            <p className="max-w-2xl text-sm text-lc-gray-light sm:text-base">
              Lo mas fresh de la temporada. Ediciones limitadas.
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
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {productsToDisplay.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-t border-lc-border bg-lc-darker/50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-heading font-bold text-lc-white sm:mb-12 sm:text-4xl">
            Explora por Categoria
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3 md:gap-8">
            {[
              { title: "Ropa", slug: "ropa", img: "/images/ropa.png" },
              { title: "Zapatos", slug: "zapatos", img: "/images/zapatos.png" },
              { title: "Accesorios", slug: "accesorios", img: "/images/accesorios.png" },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/productos?categoria=${cat.slug}`}
                className="group relative block h-52 overflow-hidden rounded-3xl border border-lc-border sm:h-64 md:h-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="h-full w-full object-cover opacity-60 transition-opacity duration-500 group-hover:scale-105 group-hover:opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-2xl font-heading font-bold uppercase tracking-[0.22em] text-white transition-transform duration-300 drop-shadow-2xl group-hover:scale-110 sm:text-3xl">
                    {cat.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
