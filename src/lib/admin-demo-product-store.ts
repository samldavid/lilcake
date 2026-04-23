"use client"

import type { AdminProductRow } from "@/components/admin/AdminProductsTable"
import type {
  ProductFormSeed,
  ProductFormSubmitPayload,
} from "@/components/admin/ProductForm"
import {
  adminDemoCategories,
  adminDemoProductSeeds,
} from "@/lib/admin-demo-data"

const ADMIN_DEMO_PRODUCTS_STORAGE_KEY = "lilcake-admin-demo-products-v1"

const defaultProducts = Object.values(adminDemoProductSeeds)
const categoryNameById = new Map(
  adminDemoCategories.map((category) => [category.id, category.name])
)

function cloneProduct(product: ProductFormSeed): ProductFormSeed {
  return {
    ...product,
    images: product.images.map((image) => ({ ...image })),
    variants: product.variants.map((variant) => ({ ...variant })),
  }
}

function cloneProducts(products: ProductFormSeed[]) {
  return products.map(cloneProduct)
}

function createDemoId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }

  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`
}

function normalizeStoredProducts(value: unknown) {
  if (!Array.isArray(value)) {
    return cloneProducts(defaultProducts)
  }

  const normalizedProducts = value
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) {
        return null
      }

      const product = entry as Partial<ProductFormSeed>

      if (
        typeof product.id !== "string" ||
        typeof product.name !== "string" ||
        typeof product.description !== "string" ||
        typeof product.price !== "number" ||
        typeof product.categoryId !== "string" ||
        typeof product.isActive !== "boolean" ||
        typeof product.isFeatured !== "boolean"
      ) {
        return null
      }

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice:
          typeof product.compareAtPrice === "number"
            ? product.compareAtPrice
            : null,
        categoryId: product.categoryId,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        images: Array.isArray(product.images)
          ? product.images
              .map((image) => {
                if (
                  typeof image === "object" &&
                  image !== null &&
                  typeof (image as { url?: unknown }).url === "string"
                ) {
                  return { url: (image as { url: string }).url }
                }

                return null
              })
              .filter((image): image is { url: string } => Boolean(image))
          : [],
        variants: Array.isArray(product.variants)
          ? product.variants
              .map((variant, index) => {
                if (typeof variant !== "object" || variant === null) {
                  return null
                }

                const currentVariant = variant as {
                  id?: unknown
                  size?: unknown
                  color?: unknown
                  sku?: unknown
                  stock?: unknown
                }

                if (
                  typeof currentVariant.sku !== "string" ||
                  typeof currentVariant.stock !== "number"
                ) {
                  return null
                }

                return {
                  id:
                    typeof currentVariant.id === "string"
                      ? currentVariant.id
                      : `${product.id}-variant-${index + 1}`,
                  size:
                    typeof currentVariant.size === "string"
                      ? currentVariant.size
                      : null,
                  color:
                    typeof currentVariant.color === "string"
                      ? currentVariant.color
                      : null,
                  sku: currentVariant.sku,
                  stock: currentVariant.stock,
                }
              })
              .filter(
                (
                  variant
                ): variant is ProductFormSeed["variants"][number] => Boolean(variant)
              )
          : [],
      } satisfies ProductFormSeed
    })
    .filter((product): product is ProductFormSeed => Boolean(product))

  return normalizedProducts.length > 0
    ? normalizedProducts
    : cloneProducts(defaultProducts)
}

export function readAdminDemoProducts() {
  if (typeof window === "undefined") {
    return cloneProducts(defaultProducts)
  }

  try {
    const storedValue = window.sessionStorage.getItem(
      ADMIN_DEMO_PRODUCTS_STORAGE_KEY
    )

    if (!storedValue) {
      return cloneProducts(defaultProducts)
    }

    return normalizeStoredProducts(JSON.parse(storedValue))
  } catch {
    return cloneProducts(defaultProducts)
  }
}

export function writeAdminDemoProducts(products: ProductFormSeed[]) {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.setItem(
    ADMIN_DEMO_PRODUCTS_STORAGE_KEY,
    JSON.stringify(products)
  )
}

export function resetAdminDemoProducts() {
  if (typeof window === "undefined") {
    return cloneProducts(defaultProducts)
  }

  window.sessionStorage.removeItem(ADMIN_DEMO_PRODUCTS_STORAGE_KEY)
  return cloneProducts(defaultProducts)
}

export function getAdminDemoProductFromStore(productId: string) {
  return readAdminDemoProducts().find((product) => product.id === productId) ?? null
}

export function upsertAdminDemoProduct(
  payload: ProductFormSubmitPayload,
  productId?: string
) {
  const currentProducts = readAdminDemoProducts()
  const existingProduct =
    currentProducts.find((product) => product.id === productId) ?? null
  const nextProductId = existingProduct?.id ?? productId ?? createDemoId("demo-product")
  const nextProduct: ProductFormSeed = {
    id: nextProductId,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    compareAtPrice: payload.compareAtPrice,
    categoryId: payload.categoryId,
    isActive: payload.isActive,
    isFeatured: payload.isFeatured,
    images: payload.images.map((url) => ({ url })),
    variants: payload.variants.map((variant, index) => ({
      id: variant.id ?? createDemoId(`${nextProductId}-variant-${index + 1}`),
      size: variant.size ?? null,
      color: variant.color ?? null,
      sku: variant.sku,
      stock: variant.stock,
    })),
  }

  const nextProducts = existingProduct
    ? currentProducts.map((product) =>
        product.id === nextProduct.id ? nextProduct : product
      )
    : [nextProduct, ...currentProducts]

  writeAdminDemoProducts(nextProducts)

  return nextProduct
}

export function removeAdminDemoProduct(productId: string) {
  const nextProducts = readAdminDemoProducts().filter(
    (product) => product.id !== productId
  )

  writeAdminDemoProducts(nextProducts)
  return nextProducts
}

export function toAdminDemoProductRows(products: ProductFormSeed[]): AdminProductRow[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    isActive: product.isActive,
    category: {
      name: categoryNameById.get(product.categoryId) ?? "Sin categoria",
    },
    variants: product.variants.map((variant) => ({
      stock: variant.stock,
    })),
    images: product.images.map((image) => ({
      url: image.url,
    })),
  }))
}
