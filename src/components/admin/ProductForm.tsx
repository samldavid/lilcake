"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { upload } from "@vercel/blob/client"
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Percent,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardBody } from "@/components/ui/Card"
import {
  isValidProductImageReference,
  normalizeProductImageReference,
} from "@/lib/image-utils"

export type ProductCategoryOption = {
  id: string
  name: string
}

type ProductVariantDraft = {
  id?: string
  tempId: string
  size: string
  color: string
  sku: string
  stock: string
}

export type ProductFormSeed = {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice: number | null
  categoryId: string
  isActive: boolean
  isFeatured: boolean
  images: Array<{ url: string }>
  variants: Array<{
    id: string
    size: string | null
    color: string | null
    sku: string
    stock: number
  }>
}

export type ProductFormSubmitPayload = {
  name: string
  description: string
  price: number
  compareAtPrice: number | null
  categoryId: string
  isActive: boolean
  isFeatured: boolean
  images: string[]
  variants: Array<{
    id?: string
    size?: string
    color?: string
    sku: string
    stock: number
    priceOverride: null
  }>
}

type ProductFormProps = {
  productId?: string
  mode?: "live" | "demo"
  basePath?: string
  demoCategories?: ProductCategoryOption[]
  demoProduct?: ProductFormSeed | null
  demoNotice?: string
  onDemoSave?: (
    payload: ProductFormSubmitPayload,
    context: { productId?: string; isEditing: boolean }
  ) => Promise<void> | void
  initialCategories?: ProductCategoryOption[]
  initialProduct?: ProductFormSeed | null
}

const EMPTY_CATEGORY_OPTIONS: ProductCategoryOption[] = []

const initialFormData = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  categoryId: "",
  isActive: true,
  isFeatured: false,
}

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]
const ACCEPTED_IMAGE_TYPES_LABEL = "JPG, PNG, WEBP, GIF o AVIF"
const MAX_PRODUCT_IMAGE_SIZE = 8 * 1024 * 1024

const IMAGE_EXTENSION_BY_TYPE: Record<string, ".jpg" | ".png" | ".webp" | ".gif" | ".avif"> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
}

function createVariantTempId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `variant-${Date.now()}`
}

function createEmptyVariant(tempId = "initial-variant"): ProductVariantDraft {
  return {
    tempId,
    size: "Unitalla",
    color: "",
    sku: "",
    stock: "1",
  }
}

function mapSeedProductToDrafts(product: ProductFormSeed) {
  return {
    formData: {
      name: product.name,
      description: product.description,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      categoryId: product.categoryId,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    },
    images: product.images.map((image) => image.url),
    variants:
      product.variants.length > 0
        ? product.variants.map((variant) => ({
            id: variant.id,
            tempId: variant.id,
            size: variant.size || "",
            color: variant.color || "",
            sku: variant.sku,
            stock: String(variant.stock),
          }))
        : [createEmptyVariant()],
  }
}

function buildProductImagePathname(file: File) {
  const currentExtension = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : ""
  const baseName = file.name
    .slice(0, currentExtension ? -currentExtension.length : undefined)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 40)
  const extension = IMAGE_EXTENSION_BY_TYPE[file.type] ?? ".jpg"
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

  return `products/${baseName || "image"}-${suffix}${extension}`
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }

      reject(new Error(`No pudimos procesar la imagen ${file.name}.`))
    }

    reader.onerror = () => {
      reject(new Error(`No pudimos leer la imagen ${file.name}.`))
    }

    reader.readAsDataURL(file)
  })
}

export function ProductForm({
  productId,
  mode = "live",
  basePath = "/admin",
  demoCategories = EMPTY_CATEGORY_OPTIONS,
  demoProduct = null,
  demoNotice = "Esto es una demo. Los cambios no se guardan.",
  onDemoSave,
  initialCategories = EMPTY_CATEGORY_OPTIONS,
  initialProduct = null,
}: ProductFormProps) {
  const router = useRouter()
  const isEditing = Boolean(productId)
  const isDemo = mode === "demo"
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const previewUrlsRef = React.useRef<string[]>([])
  const liveSeedState = React.useMemo(
    () => (initialProduct ? mapSeedProductToDrafts(initialProduct) : null),
    [initialProduct]
  )
  const demoSeedState = React.useMemo(
    () => (demoProduct ? mapSeedProductToDrafts(demoProduct) : null),
    [demoProduct]
  )
  const hasInitialLiveData =
    !isDemo && initialCategories.length > 0 && (!isEditing || Boolean(liveSeedState))

  const [loading, setLoading] = React.useState(false)
  const [uploadingImages, setUploadingImages] = React.useState(false)
  const [isBootstrapping, setIsBootstrapping] = React.useState(
    isDemo ? false : !hasInitialLiveData
  )
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const [imageInput, setImageInput] = React.useState("")
  const [categories, setCategories] = React.useState<ProductCategoryOption[]>(
    isDemo ? demoCategories : initialCategories
  )
  const [formData, setFormData] = React.useState(
    isDemo
      ? demoSeedState?.formData ?? initialFormData
      : liveSeedState?.formData ?? initialFormData
  )
  const [images, setImages] = React.useState<string[]>(
    isDemo ? demoSeedState?.images ?? [] : liveSeedState?.images ?? []
  )
  const [variants, setVariants] = React.useState<ProductVariantDraft[]>(
    isDemo
      ? demoSeedState?.variants ?? [createEmptyVariant()]
      : liveSeedState?.variants ?? [createEmptyVariant()]
  )
  const saleEnabled = formData.compareAtPrice.trim().length > 0
  const priceValue = Number(formData.price)
  const compareAtPriceValue = Number(formData.compareAtPrice)
  const saleDiscount =
    saleEnabled &&
    Number.isFinite(priceValue) &&
    Number.isFinite(compareAtPriceValue) &&
    compareAtPriceValue > priceValue
      ? Math.round(((compareAtPriceValue - priceValue) / compareAtPriceValue) * 100)
      : null
  const suggestedCompareAtPrice =
    Number.isFinite(priceValue) && priceValue > 0
      ? String(Math.ceil(priceValue * 1.2))
      : "1"

  React.useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      previewUrlsRef.current = []
    }
  }, [])

  React.useEffect(() => {
    let isActive = true

    if (!isDemo && hasInitialLiveData) {
      setIsBootstrapping(false)

      return () => {
        isActive = false
      }
    }

    const loadForm = async () => {
      try {
        setError("")
        setSuccess("")

        if (isDemo) {
          setIsBootstrapping(false)
          setCategories(demoCategories)

          if (isEditing && demoSeedState) {
            const nextState = demoSeedState
            setFormData(nextState.formData)
            setImages(nextState.images)
            setVariants(nextState.variants)
          } else {
            setFormData(initialFormData)
            setImages([])
            setVariants([createEmptyVariant()])
          }

          return
        }

        setIsBootstrapping(true)

        const requests = [
          fetch("/api/categories"),
          ...(productId ? [fetch(`/api/admin/products/${productId}`)] : []),
        ]

        const responses = await Promise.all(requests)
        const categoriesResponse = responses[0]
        const categoriesData = await categoriesResponse.json()

        if (!categoriesResponse.ok) {
          throw new Error(categoriesData.error || "No pudimos cargar las categorias.")
        }

        if (!isActive) {
          return
        }

        setCategories(categoriesData)

        if (productId) {
          const productResponse = responses[1]
          const productData: ProductFormSeed = await productResponse.json()

          if (!productResponse.ok) {
            throw new Error(productData?.name || "No pudimos cargar el producto.")
          }

          if (!isActive) {
            return
          }

          const nextState = mapSeedProductToDrafts(productData)
          setFormData(nextState.formData)
          setImages(nextState.images)
          setVariants(nextState.variants)
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No pudimos preparar el formulario."
          )
        }
      } finally {
        if (isActive) {
          setIsBootstrapping(false)
        }
      }
    }

    void loadForm()

    return () => {
      isActive = false
    }
  }, [
    demoCategories,
    demoSeedState,
    hasInitialLiveData,
    initialCategories,
    isDemo,
    isEditing,
    liveSeedState,
    productId,
  ])

  const addVariant = () => {
    setVariants((current) => [...current, createEmptyVariant(createVariantTempId())])
  }

  const removeVariant = (tempId: string) => {
    setVariants((current) => {
      if (current.length <= 1) {
        return current
      }

      return current.filter((variant) => variant.tempId !== tempId)
    })
  }

  const updateVariant = (
    tempId: string,
    field: keyof Omit<ProductVariantDraft, "id" | "tempId">,
    value: string
  ) => {
    setVariants((current) =>
      current.map((variant) =>
        variant.tempId === tempId ? { ...variant, [field]: value } : variant
      )
    )
  }

  const addImageReference = (value: string) => {
    const normalizedValue = normalizeProductImageReference(value)

    if (!isValidProductImageReference(normalizedValue)) {
      setError("Usa una URL valida o una ruta publica como /images/foto.png.")
      return false
    }

    setImages((current) => {
      if (current.includes(normalizedValue)) {
        return current
      }

      return [...current, normalizedValue]
    })
    setError("")
    setSuccess(isDemo ? demoNotice : "")
    return true
  }

  const handleAddImageByPath = () => {
    if (!imageInput.trim()) {
      return
    }

    const wasAdded = addImageReference(imageInput)

    if (wasAdded) {
      setImageInput("")
    }
  }

  const handleFileSelection = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = e.target.files

    if (!fileList || fileList.length === 0) {
      return
    }

    try {
      setUploadingImages(true)
      setError("")
      setSuccess("")

      const selectedFiles = Array.from(fileList)
      const invalidTypeFile = selectedFiles.find(
        (file) => !ACCEPTED_IMAGE_TYPES.includes(file.type)
      )

      if (invalidTypeFile) {
        throw new Error(
          `La imagen ${invalidTypeFile.name} debe ser ${ACCEPTED_IMAGE_TYPES_LABEL}.`
        )
      }

      const oversizedFile = selectedFiles.find(
        (file) => file.size > MAX_PRODUCT_IMAGE_SIZE
      )

      if (oversizedFile) {
        throw new Error(
          `La imagen ${oversizedFile.name} supera el limite de 8 MB.`
        )
      }

      if (isDemo) {
        const previewUrls = await Promise.all(
          selectedFiles.map((file) => readFileAsDataUrl(file))
        )

        setImages((current) => {
          const nextImages = [...current]

          for (const previewUrl of previewUrls) {
            if (!nextImages.includes(previewUrl)) {
              nextImages.push(previewUrl)
            }
          }

          return nextImages
        })
        setSuccess(demoNotice)
        return
      }

      const uploadedFiles: string[] = []

      try {
        for (const file of selectedFiles) {
          const blob = await upload(buildProductImagePathname(file), file, {
            access: "public",
            contentType: file.type,
            handleUploadUrl: "/api/admin/uploads/images",
            multipart: file.size > 4 * 1024 * 1024,
            clientPayload: JSON.stringify({
              name: file.name,
              type: file.type,
              size: file.size,
            }),
          })

          uploadedFiles.push(blob.url)
        }
      } catch (directUploadError) {
        const directUploadMessage =
          directUploadError instanceof Error ? directUploadError.message : ""
        const shouldUseServerFallback =
          directUploadMessage.includes("BLOB_CLIENT_UPLOAD_UNAVAILABLE") ||
          directUploadMessage.includes("Failed to retrieve the client token")

        if (!shouldUseServerFallback) {
          throw directUploadError
        }

        const uploadData = new FormData()

        selectedFiles.forEach((file) => {
          uploadData.append("files", file)
        })

        const response = await fetch("/api/admin/uploads/images", {
          method: "POST",
          body: uploadData,
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "No pudimos subir las imagenes.")
        }

        uploadedFiles.push(...(data.files as string[]))
      }

      setImages((current) => {
        const nextImages = [...current]

        for (const fileUrl of uploadedFiles) {
          if (!nextImages.includes(fileUrl)) {
            nextImages.push(fileUrl)
          }
        }

        return nextImages
      })
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No pudimos subir las imagenes."
      )
    } finally {
      setUploadingImages(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const moveImageToFront = (imageUrl: string) => {
    setImages((current) => [
      imageUrl,
      ...current.filter((existingImage) => existingImage !== imageUrl),
    ])
  }

  const moveImage = (fromIndex: number, direction: -1 | 1) => {
    setImages((current) => {
      const toIndex = fromIndex + direction

      if (toIndex < 0 || toIndex >= current.length) {
        return current
      }

      const nextImages = [...current]
      const [movedImage] = nextImages.splice(fromIndex, 1)

      if (!movedImage) {
        return current
      }

      nextImages.splice(toIndex, 0, movedImage)

      return nextImages
    })
  }

  const removeImage = (imageUrl: string) => {
    if (imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imageUrl)
      previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== imageUrl)
    }

    setImages((current) =>
      current.filter((existingImage) => existingImage !== imageUrl)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      if (images.length === 0) {
        throw new Error("Debes agregar al menos una imagen.")
      }

      const price = Number(formData.price)
      const compareAtPrice = formData.compareAtPrice
        ? Number(formData.compareAtPrice)
        : null

      if (compareAtPrice !== null && compareAtPrice <= price) {
        throw new Error("El precio anterior debe ser mayor al precio final.")
      }

      const payload: ProductFormSubmitPayload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        compareAtPrice,
        categoryId: formData.categoryId,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        images,
        variants: variants.map((variant) => ({
          ...(variant.id ? { id: variant.id } : {}),
          size: variant.size.trim() || undefined,
          color: variant.color.trim() || undefined,
          sku: variant.sku.trim(),
          stock: Number(variant.stock),
          priceOverride: null,
        })),
      }

      if (isDemo) {
        await Promise.resolve(onDemoSave?.(payload, { productId, isEditing }))
        await new Promise((resolve) => setTimeout(resolve, 450))
        setSuccess(demoNotice)
        if (onDemoSave) {
          router.push(`${basePath}/productos`)
          router.refresh()
        }
        return
      }

      const endpoint = isEditing
        ? `/api/admin/products/${productId}`
        : "/api/admin/products"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No pudimos guardar el producto.")
      }

      router.push(`${basePath}/productos`)
      router.refresh()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No pudimos guardar el producto."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl animate-fade-in pb-12">
      <div className="mb-6 flex flex-col items-start gap-4 sm:mb-8 sm:flex-row sm:items-center">
        <Link
          href={`${basePath}/productos`}
          className="rounded-full border border-lc-border bg-lc-dark p-2 text-lc-gray transition-colors hover:text-lc-white"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-lc-white sm:text-3xl">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h1>
          <p className="mt-1 text-sm text-lc-gray">
            {isEditing
              ? "Actualiza la informacion principal del producto."
              : "Completa los datos para crear un nuevo articulo."}
          </p>
        </div>
      </div>

      {isDemo ? (
        <div className="mb-6 rounded-2xl border border-lc-warning/30 bg-lc-warning/10 p-4 text-sm text-lc-warning">
          Modo demo activo. Puedes probar el formulario completo sin afectar el
          catalogo real.
        </div>
      ) : null}

      {success ? (
        <div className="mb-6 rounded-2xl border border-lc-success/30 bg-lc-success/10 p-4 text-sm text-lc-success">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-2xl border border-lc-error/30 bg-lc-error/10 p-4 text-sm text-lc-error">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="col-span-1 space-y-6 lg:col-span-2 lg:space-y-8">
          <Card>
            <CardBody className="space-y-6">
              <h2 className="mb-4 text-xl font-bold font-heading text-lc-white">
                Informacion Basica
              </h2>

              <Input
                label="Nombre del Producto"
                required
                placeholder="Ej. Hoodie Essential Oversize"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isBootstrapping}
              />

              <div>
                <label className="mb-1.5 ml-1 block text-sm font-medium text-lc-gray-light">
                  Descripcion
                </label>
                <textarea
                  required
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Detalles sobre fit, material y cuidados..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={isBootstrapping}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold font-heading text-lc-white">
                    Galería de Imágenes
                  </h2>
                  <p className="mt-1 text-sm text-lc-gray">
                    La primera imagen será la portada. Puedes cambiar el orden antes de guardar.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBootstrapping || uploadingImages}
                  className="flex items-center gap-2"
                >
                  {uploadingImages ? <Upload size={16} /> : <ImagePlus size={16} />}
                  {uploadingImages ? "Subiendo..." : "Añadir imágenes"}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                multiple
                className="hidden"
                onChange={handleFileSelection}
              />

              <div className="rounded-2xl border border-dashed border-lc-border bg-lc-darker/40 p-4">
                <label className="mb-2 block text-sm font-medium text-lc-gray-light">
                  Añadir por ruta pública o URL
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="/images/retro1999.png o https://..."
                    className="input-field flex-1"
                    disabled={isBootstrapping}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddImageByPath}
                    disabled={isBootstrapping || !imageInput.trim()}
                    className="flex w-full items-center justify-center gap-2 sm:w-auto"
                  >
                    <Plus size={16} />
                    Añadir
                  </Button>
                </div>
              </div>

              {images.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-lc-border bg-lc-darker/40 p-8 text-center text-sm text-lc-gray">
                  Sube una o varias imágenes, o usa una ruta pública como{" "}
                  <code>/images/retro1999.png</code>.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {images.map((imageUrl, index) => (
                    <div
                      key={imageUrl}
                      className="overflow-hidden rounded-2xl border border-lc-border bg-lc-darker/50"
                    >
                      <div className="group relative aspect-[4/5] overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Vista previa ${index + 1}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-lc-black/80 to-transparent p-3">
                          <span className="text-xs font-bold uppercase tracking-wide text-lc-white">
                            {index === 0 ? "Portada" : `Imagen ${index + 1}`}
                          </span>
                          <span className="mt-1 block text-[11px] font-medium text-lc-gray-light">
                            Posición {index + 1} de {images.length}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 p-3">
                        <Button
                          type="button"
                          size="sm"
                          variant={index === 0 ? "primary" : "secondary"}
                          onClick={() => moveImageToFront(imageUrl)}
                          disabled={index === 0}
                          className="w-full"
                        >
                          <Star size={14} className="mr-2" />
                          {index === 0 ? "Principal" : "Hacer principal"}
                        </Button>

                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                          <button
                            type="button"
                            onClick={() => moveImage(index, -1)}
                            disabled={index === 0}
                            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-lc-border px-3 text-xs font-semibold text-lc-gray-light transition-colors hover:border-lc-purple/50 hover:text-lc-white disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Mover imagen ${index + 1} antes`}
                          >
                            <ArrowUp size={14} />
                            Subir
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(index, 1)}
                            disabled={index === images.length - 1}
                            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-lc-border px-3 text-xs font-semibold text-lc-gray-light transition-colors hover:border-lc-purple/50 hover:text-lc-white disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Mover imagen ${index + 1} después`}
                          >
                            <ArrowDown size={14} />
                            Bajar
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(imageUrl)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-lc-border text-lc-gray transition-colors hover:border-lc-error/40 hover:text-lc-error"
                            aria-label="Eliminar imagen"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold font-heading text-lc-white">
                  Variantes
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addVariant}
                  className="flex w-full items-center justify-center gap-2 sm:w-auto"
                  disabled={isBootstrapping}
                >
                  <Plus size={16} /> Anadir Variante
                </Button>
              </div>

              <div className="space-y-4">
                {variants.map((variant) => (
                  <div
                    key={variant.tempId}
                    className="relative grid grid-cols-1 gap-4 rounded-xl border border-lc-border bg-lc-darker/50 p-4 sm:grid-cols-2 xl:grid-cols-4"
                  >
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.tempId)}
                      className="absolute -right-3 -top-3 z-10 rounded-full bg-lc-error p-1.5 text-white transition-colors hover:bg-red-600"
                      disabled={variants.length <= 1 || isBootstrapping}
                    >
                      <X size={14} />
                    </button>

                    <div>
                      <label className="mb-1 block text-xs text-lc-gray">Talla</label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(variant.tempId, "size", e.target.value)
                        }
                        className="w-full rounded-lg border border-lc-border bg-lc-dark px-3 py-2 text-sm text-lc-white outline-none focus:border-lc-purple"
                        placeholder="S, M, L..."
                        disabled={isBootstrapping}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-lc-gray">Color</label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) =>
                          updateVariant(variant.tempId, "color", e.target.value)
                        }
                        className="w-full rounded-lg border border-lc-border bg-lc-dark px-3 py-2 text-sm text-lc-white outline-none focus:border-lc-purple"
                        placeholder="Black, White..."
                        disabled={isBootstrapping}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-lc-gray">SKU</label>
                      <input
                        type="text"
                        required
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(variant.tempId, "sku", e.target.value)
                        }
                        className="w-full rounded-lg border border-lc-border bg-lc-dark px-3 py-2 text-sm text-lc-white outline-none focus:border-lc-purple"
                        disabled={isBootstrapping}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-lc-gray">Stock</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(variant.tempId, "stock", e.target.value)
                        }
                        className="w-full rounded-lg border border-lc-border bg-lc-dark px-3 py-2 text-sm text-lc-white outline-none focus:border-lc-purple"
                        disabled={isBootstrapping}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="col-span-1 space-y-6 lg:space-y-8">
          <Card>
            <CardBody className="space-y-6">
              <h2 className="mb-4 text-xl font-bold font-heading text-lc-white">
                Organizacion
              </h2>

              <div>
                <label className="mb-1.5 ml-1 block text-sm font-medium text-lc-gray-light">
                  Categoria
                </label>
                <select
                  required
                  className="w-full rounded-xl border border-lc-border bg-lc-darker px-4 py-3 text-sm text-lc-white outline-none focus:border-lc-purple"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  disabled={isBootstrapping}
                >
                  <option value="">Selecciona una categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-lc-border bg-lc-darker p-4">
                <div>
                  <div className="text-sm font-bold text-lc-white">Estado Activo</div>
                  <div className="text-xs text-lc-gray">Visible en la tienda</div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="peer sr-only"
                    disabled={isBootstrapping}
                  />
                  <div className="h-6 w-11 rounded-full bg-lc-border peer-focus:outline-none peer-checked:bg-lc-success peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']"></div>
                </label>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-lc-border bg-lc-darker p-4">
                <div>
                  <div className="text-sm font-bold text-lc-purple-light">
                    Drop Exclusivo
                  </div>
                  <div className="text-xs text-lc-gray">Mostrar en portada</div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="peer sr-only"
                    disabled={isBootstrapping}
                  />
                  <div className="h-6 w-11 rounded-full bg-lc-border peer-focus:outline-none peer-checked:bg-lc-purple peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']"></div>
                </label>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-6">
              <h2 className="mb-4 text-xl font-bold font-heading text-lc-white">
                Precios (COP)
              </h2>

              <Input
                label="Precio Final"
                type="number"
                required
                min="0"
                placeholder="150000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                disabled={isBootstrapping}
              />

              <div className="rounded-xl border border-lc-border bg-lc-darker p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg border border-lc-pink/25 bg-lc-pink/10 p-2 text-lc-pink">
                      <Percent size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-lc-white">
                        Poner en oferta
                      </div>
                      <div className="mt-1 text-xs leading-5 text-lc-gray">
                        Muestra precio anterior tachado, badge de descuento y
                        bloque de ofertas en la tienda.
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={saleEnabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          compareAtPrice: e.target.checked
                            ? formData.compareAtPrice || suggestedCompareAtPrice
                            : "",
                        })
                      }
                      className="peer sr-only"
                      disabled={isBootstrapping}
                    />
                    <div className="h-6 w-11 rounded-full bg-lc-border peer-focus:outline-none peer-checked:bg-lc-pink peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['']"></div>
                  </label>
                </div>

                {saleEnabled ? (
                  <div className="mt-4">
                    <Input
                      label="Precio anterior"
                      type="number"
                      min="0"
                      placeholder="180000"
                      value={formData.compareAtPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, compareAtPrice: e.target.value })
                      }
                      disabled={isBootstrapping}
                    />
                    <p className="mt-2 text-xs leading-5 text-lc-gray">
                      Debe ser mayor al precio final.{" "}
                      {saleDiscount ? (
                        <span className="font-bold text-lc-pink">
                          Descuento visible: -{saleDiscount}%.
                        </span>
                      ) : null}
                    </p>
                  </div>
                ) : null}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-lc-border pt-6 sm:mt-8 sm:flex-row sm:justify-end sm:gap-4 sm:pt-8 lg:col-span-3">
          <Link href={`${basePath}/productos`} className="w-full sm:w-auto">
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || uploadingImages || isBootstrapping}
            className="w-full sm:w-48"
          >
            {loading
              ? isDemo
                ? "Simulando..."
                : "Guardando..."
              : isDemo
                ? isEditing
                  ? "Simular cambios"
                  : "Simular creacion"
                : isEditing
                  ? "Guardar Cambios"
                  : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </div>
  )
}
