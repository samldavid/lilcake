import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type StorefrontSearchProduct = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  isFeatured: boolean
  images: { url: string; altText: string | null }[]
  category: { name: string; slug: string }
}

type SearchOptions = {
  categorySlug?: string
  limit?: number
}

const PRODUCT_SEARCH_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
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
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductSelect

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

function normalizeQuery(query: string) {
  return query.replace(/\s+/g, " ").trim()
}

function getSearchTerms(query: string) {
  return normalizeQuery(query)
    .split(" ")
    .map((term) => term.trim())
    .filter(Boolean)
}

function getProductSearchScore(
  product: StorefrontSearchProduct,
  normalizedQuery: string,
  terms: string[]
) {
  const name = normalizeSearchValue(product.name)
  const slug = normalizeSearchValue(product.slug)
  const description = normalizeSearchValue(product.description)
  const category = normalizeSearchValue(product.category.name)

  let score = 0

  if (name === normalizedQuery) score += 1200
  if (slug === normalizedQuery) score += 1100
  if (name.startsWith(normalizedQuery)) score += 800
  if (slug.startsWith(normalizedQuery)) score += 720
  if (name.includes(normalizedQuery)) score += 520
  if (category.includes(normalizedQuery)) score += 180
  if (description.includes(normalizedQuery)) score += 120

  terms.forEach((term) => {
    const normalizedTerm = normalizeSearchValue(term)

    if (name.startsWith(normalizedTerm)) score += 90
    if (name.includes(normalizedTerm)) score += 65
    if (slug.includes(normalizedTerm)) score += 50
    if (category.includes(normalizedTerm)) score += 28
    if (description.includes(normalizedTerm)) score += 12
  })

  if (product.isFeatured) score += 8
  if (product.compareAtPrice) score += 4

  return score
}

export async function getFeaturedSearchProducts(limit = 6) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    select: PRODUCT_SEARCH_SELECT,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: Math.min(Math.max(limit, 1), 12),
  })
}

export async function searchStorefrontProducts(
  query: string,
  options: SearchOptions = {}
) {
  const normalizedQuery = normalizeQuery(query)

  if (normalizedQuery.length < 3) {
    return []
  }

  const terms = getSearchTerms(normalizedQuery)
  const { categorySlug, limit = 12 } = options

  const filters: Prisma.ProductWhereInput[] = [{ isActive: true }]

  if (categorySlug) {
    filters.push({
      category: {
        is: {
          slug: categorySlug,
        },
      },
    })
  }

  if (terms.length > 0) {
    filters.push({
      AND: terms.map((term) => ({
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          {
            category: {
              is: {
                name: { contains: term, mode: "insensitive" },
              },
            },
          },
        ],
      })),
    })
  }

  const candidates = await prisma.product.findMany({
    where: {
      AND: filters,
    },
    select: PRODUCT_SEARCH_SELECT,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: Math.min(Math.max(limit * 4, 24), 60),
  })

  return candidates
    .map((product) => ({
      product,
      score: getProductSearchScore(product, normalizeSearchValue(normalizedQuery), terms),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return left.product.name.localeCompare(right.product.name, "es", {
        sensitivity: "base",
      })
    })
    .slice(0, Math.min(Math.max(limit, 1), 24))
    .map((entry) => entry.product)
}

export async function getCatalogProductsForSearch(options: SearchOptions = {}) {
  const { categorySlug, limit = 24 } = options

  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug
        ? {
            category: {
              is: {
                slug: categorySlug,
              },
            },
          }
        : {}),
    },
    select: PRODUCT_SEARCH_SELECT,
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 48),
  })
}
