import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import {
  AdminProductConflictError,
  adminProductPayloadSchema,
  ensureUniqueProductSlug,
  ensureVariantSkusAreAvailable,
} from "@/lib/admin-products"
import {
  adminNotFoundResponse,
  requireAdminApiSession,
} from "@/lib/auth-guards"
import { Prisma } from "@prisma/client"
import { getPublicErrorMessage } from "@/lib/errors"

export async function GET() {
  try {
    const session = await requireAdminApiSession()

    if (!session) {
      return adminNotFoundResponse()
    }

    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Admin products GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdminApiSession()

    if (!session) {
      return adminNotFoundResponse()
    }

    const body = await req.json()
    const result = adminProductPayloadSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Datos invalidos" },
        { status: 400 }
      )
    }

    const data = result.data
    const slug = await ensureUniqueProductSlug(data.name)
    await ensureVariantSkusAreAvailable(data.variants)

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        categoryId: data.categoryId,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        images: {
          create: data.images.map((url, index) => ({ url, sortOrder: index })),
        },
        variants: {
          create: data.variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            sku: variant.sku,
            stock: variant.stock,
            priceOverride: variant.priceOverride,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    })

    revalidatePath("/")
    revalidatePath("/productos")
    revalidatePath(`/productos/${product.slug}`)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Admin products POST error:", error)

    if (error instanceof AdminProductConflictError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "El nombre o uno de los SKU ya esta en uso." },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error: getPublicErrorMessage(error, {
          fallbackMessage: "No pudimos guardar el producto.",
        }),
      },
      { status: 500 }
    )
  }
}
