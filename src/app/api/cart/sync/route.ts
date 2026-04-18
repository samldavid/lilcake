import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const localItems = Array.isArray(body.items) ? body.items : []
    const mode = body.mode === "replace" ? "replace" : "merge"
    const clientVersion =
      Number.isInteger(body.version) && body.version >= 0 ? body.version : 0

    const userId = session.user.id

    const serverVersion = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { cartVersion: true },
      })

      const currentVersion = user?.cartVersion ?? 0

      if (clientVersion < currentVersion) {
        return currentVersion
      }

      const dbItems = await tx.cartItem.findMany({
        where: { userId },
        select: {
          id: true,
          variantId: true,
          quantity: true,
        },
      })

      const desiredItems = new Map<string, number>()

      if (mode === "merge") {
        dbItems.forEach((item) => {
          desiredItems.set(item.variantId, item.quantity)
        })
      }

      for (const item of localItems) {
        if (
          !item?.variantId ||
          typeof item.quantity !== "number" ||
          item.quantity <= 0
        ) {
          continue
        }

        if (mode === "merge") {
          desiredItems.set(
            item.variantId,
            Math.max(desiredItems.get(item.variantId) ?? 0, item.quantity)
          )
        } else {
          desiredItems.set(item.variantId, item.quantity)
        }
      }

      const desiredEntries = [...desiredItems.entries()]
      const desiredVariantIds = desiredEntries.map(([variantId]) => variantId)

      await tx.cartItem.deleteMany({
        where: desiredVariantIds.length
          ? {
              userId,
              variantId: { notIn: desiredVariantIds },
            }
          : { userId },
      })

      for (const [variantId, quantity] of desiredEntries) {
        const existing = dbItems.find((item) => item.variantId === variantId)

        if (existing) {
          await tx.cartItem.updateMany({
            where: {
              id: existing.id,
              userId,
            },
            data: { quantity },
          })
        } else {
          await tx.cartItem.create({
            data: {
              userId,
              variantId,
              quantity,
            },
          })
        }
      }

      if (clientVersion > currentVersion) {
        await tx.user.update({
          where: { id: userId },
          data: { cartVersion: clientVersion },
        })
      }

      return Math.max(clientVersion, currentVersion)
    })

    const freshDbItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    })

    const mergedCart = freshDbItems.map((item) => ({
      variantId: item.variantId,
      productId: item.variant.productId,
      productSlug: item.variant.product.slug,
      name: item.variant.product.name,
      price: item.variant.priceOverride ?? item.variant.product.price,
      quantity: item.quantity,
      image: item.variant.product.images?.[0]?.url || "",
      size: item.variant.size,
      color: item.variant.color,
      stock: item.variant.stock
    }))

    return NextResponse.json({ cart: mergedCart, version: serverVersion })
  } catch (error) {
    console.error("Cart sync error:", error)
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 })
  }
}
