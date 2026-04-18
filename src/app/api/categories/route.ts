import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const revalidate = 300

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { sortOrder: "asc" }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
