import { unstable_cache } from "next/cache"
import {
  getCatalogProductsForSearch,
  searchStorefrontProducts,
} from "@/lib/product-search"
import { prisma } from "@/lib/prisma"

export const getStorefrontCategories = unstable_cache(
  async () =>
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { sortOrder: "asc" },
    }),
  ["storefront-categories"],
  {
    revalidate: 300,
    tags: ["storefront-categories"],
  }
)

export const getFeaturedProducts = unstable_cache(
  async () =>
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        isFeatured: true,
        images: {
          select: {
            url: true,
            altText: true,
          },
          orderBy: { sortOrder: "asc" },
          take: 2,
        },
        variants: {
          select: {
            stock: true,
          },
        },
        category: { select: { name: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
  ["storefront-featured-products"],
  {
    revalidate: 60,
    tags: ["storefront-products"],
  }
)

export const getSaleProducts = unstable_cache(
  async () =>
    prisma.product.findMany({
      where: {
        isActive: true,
        compareAtPrice: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        isFeatured: true,
        images: {
          select: {
            url: true,
            altText: true,
          },
          orderBy: { sortOrder: "asc" },
          take: 2,
        },
        variants: {
          select: {
            stock: true,
          },
        },
        category: { select: { name: true } },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
  ["storefront-sale-products"],
  {
    revalidate: 60,
    tags: ["storefront-products"],
  }
)

export const getCatalogProducts = unstable_cache(
  async (categorySlug?: string, searchQuery?: string) => {
    const normalizedSearchQuery = searchQuery?.trim()

    if (normalizedSearchQuery && normalizedSearchQuery.length >= 3) {
      return searchStorefrontProducts(normalizedSearchQuery, {
        categorySlug,
        limit: 24,
      })
    }

    return getCatalogProductsForSearch({
      categorySlug,
      limit: 24,
    })
  },
  ["storefront-product-catalog"],
  {
    revalidate: 60,
    tags: ["storefront-products"],
  }
)

export const getProductBySlug = unstable_cache(
  async (slug: string) =>
    prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        compareAtPrice: true,
        isFeatured: true,
        images: {
          select: {
            id: true,
            url: true,
            altText: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          select: {
            id: true,
            size: true,
            color: true,
            stock: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
  ["storefront-product-detail"],
  {
    revalidate: 60,
    tags: ["storefront-products"],
  }
)
