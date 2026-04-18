import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const q = searchParams.get("q")
    const featured = searchParams.get("featured")

    const query: Prisma.ProductWhereInput = { isActive: true }

    if (category) {
      query.category = { slug: category }
    }

    if (q) {
      query.name = { contains: q } // Assuming SQLite here
    }

    if (featured) {
      query.isFeatured = true
    }

    const products = await prisma.product.findMany({
      where: query,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        category: { select: { name: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
