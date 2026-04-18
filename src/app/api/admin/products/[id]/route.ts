import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import {
  adminProductPayloadSchema,
  ensureUniqueProductSlug,
} from "@/lib/admin-products"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          orderBy: { sku: "asc" },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "No encontramos el producto." },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Admin product GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = adminProductPayloadSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Datos invalidos" },
        { status: 400 }
      )
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: {
        slug: true,
        variants: {
          select: { id: true },
        },
      },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: "No encontramos el producto." },
        { status: 404 }
      )
    }

    const data = result.data
    const slug = await ensureUniqueProductSlug(data.name, id)

    const updatedProduct = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
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
            deleteMany: {},
            create: data.images.map((url, index) => ({
              url,
              sortOrder: index,
            })),
          },
        },
      })

      const existingVariantIds = new Set(
        existingProduct.variants.map((variant) => variant.id)
      )
      const submittedVariantIds = new Set(
        data.variants
          .map((variant) => variant.id)
          .filter((variantId): variantId is string => Boolean(variantId))
      )

      for (const variant of data.variants) {
        if (variant.id && existingVariantIds.has(variant.id)) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              size: variant.size,
              color: variant.color,
              sku: variant.sku,
              stock: variant.stock,
              priceOverride: variant.priceOverride,
            },
          })
        } else {
          await tx.productVariant.create({
            data: {
              productId: id,
              size: variant.size,
              color: variant.color,
              sku: variant.sku,
              stock: variant.stock,
              priceOverride: variant.priceOverride,
            },
          })
        }
      }

      const removedVariantIds = [...existingVariantIds].filter(
        (variantId) => !submittedVariantIds.has(variantId)
      )

      if (removedVariantIds.length > 0) {
        await tx.productVariant.deleteMany({
          where: {
            id: { in: removedVariantIds },
            productId: id,
            orderItems: { none: {} },
            cartItems: { none: {} },
          },
        })
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          variants: true,
          images: true,
        },
      })
    })

    if (updatedProduct?.slug) {
      revalidatePath("/")
      revalidatePath("/productos")
      revalidatePath(`/productos/${updatedProduct.slug}`)

      if (existingProduct.slug !== updatedProduct.slug) {
        revalidatePath(`/productos/${existingProduct.slug}`)
      }
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error"

    console.error("Admin product PUT error:", error)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
