import { NextResponse } from "next/server"
import {
  getCatalogProductsForSearch,
  getFeaturedSearchProducts,
  searchStorefrontProducts,
} from "@/lib/product-search"

function parseLimit(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, 1), 24)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const categorySlug = searchParams.get("category") ?? undefined
    const rawQuery = searchParams.get("q")?.trim() ?? ""
    const featured = searchParams.get("featured")
    const limit = parseLimit(searchParams.get("limit"), featured ? 6 : 24)

    if (featured === "true") {
      const products = await getFeaturedSearchProducts(limit)
      return NextResponse.json(products)
    }

    if (rawQuery.length >= 3) {
      const products = await searchStorefrontProducts(rawQuery, {
        categorySlug,
        limit,
      })

      return NextResponse.json(products)
    }

    const products = await getCatalogProductsForSearch({
      categorySlug,
      limit,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
