import { HeroSection } from "@/components/storefront/HeroSection"
import {
  ProductCard,
  type ProductCardProduct,
} from "@/components/storefront/ProductCard"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

// This page uses Server Components
export const dynamic = "force-dynamic" // In a real app, you might want to revalidate every X hours

// Dummy products if DB is empty - same vibe as original, but adapted to LilCake
const dummyProducts: ProductCardProduct[] = [
  {
    id: "1",
    name: "Hoodie Essential Oversize - Black",
    slug: "hoodie-essential-oversize-black",
    price: 120000,
    compareAtPrice: 150000,
    images: [{ url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop", altText: "Hoodie" }],
    category: { name: "Ropa" },
    isFeatured: true
  },
  {
    id: "2",
    name: "Sneakers LC Pro - White/Purple",
    slug: "sneakers-lc-pro-white-purple",
    price: 280000,
    compareAtPrice: null,
    images: [{ url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop", altText: "Sneakers" }],
    category: { name: "Zapatos" },
    isFeatured: false
  },
  {
    id: "3",
    name: "Riñonera Urban Tech - Jet Black",
    slug: "rinonera-urban-tech-jet-black",
    price: 85000,
    compareAtPrice: 95000,
    images: [{ url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop", altText: "Riñonera" }],
    category: { name: "Accesorios" },
    isFeatured: true
  },
  {
    id: "4",
    name: "Gorra Snapback Logo - Pink",
    slug: "gorra-snapback-logo-pink",
    price: 45000,
    compareAtPrice: null,
    images: [{ url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop", altText: "Gorra" }],
    category: { name: "Accesorios" },
    isFeatured: false
  }
]

export default async function HomePage() {
  let featuredProducts: ProductCardProduct[] = []
  
  try {
    featuredProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        category: { select: { name: true } }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 4
    })
  } catch (error) {
    console.error("Error fetching products:", error)
  }

  // Use dummy products if database has no products yet
  const productsToDisplay = featuredProducts.length > 0 ? featuredProducts : dummyProducts

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-lc-white mb-2">
              Nuevos Lanzamientos
            </h2>
            <p className="text-lc-gray-light">Lo más fresh de la temporada. Ediciones limitadas.</p>
          </div>
          <Link 
            href="/productos" 
            className="group flex items-center text-sm font-semibold text-lc-purple hover:text-lc-purple-light transition-colors"
          >
            Ver todo el catálogo
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productsToDisplay.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories Banner Section */}
      <section className="py-20 border-t border-lc-border bg-lc-darker/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-lc-white mb-12">
            Explora por Categoría
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Ropa", slug: "ropa", img: "/images/ropa.png" },
              { title: "Zapatos", slug: "zapatos", img: "/images/zapatos.png" },
              { title: "Accesorios", slug: "accesorios", img: "/images/accesorios.png" }
            ].map((cat) => (
              <Link 
                key={cat.slug} 
                href={`/productos?categoria=${cat.slug}`}
                className="group relative h-64 md:h-80 rounded-3xl overflow-hidden block border border-lc-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={cat.img} 
                  alt={cat.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-3xl font-heading font-bold text-white tracking-widest uppercase group-hover:scale-110 transition-transform duration-300 drop-shadow-2xl">
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
