"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ImagePlus,
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

type ProductFormProps = {
  productId?: string
  mode?: "live" | "demo"
  basePath?: string
  demoCategories?: ProductCategoryOption[]
  demoProduct?: ProductFormSeed | null
  demoNotice?: string
  initialCategories?: ProductCategoryOption[]
  initialProduct?: ProductFormSeed | null
}

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

export function ProductForm({
  productId,
  mode = "live",
  basePath = "/admin",
  demoCategories = [],
  demoProduct = null,
  demoNotice = "Esto es una demo. Los cambios no se guardan.",
  initialCategories = [],
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
        const previewUrls = selectedFiles.map((file) => {
          const url = URL.createObjectURL(file)
          previewUrlsRef.current.push(url)
          return url
        })

        setImages((current) => [...current, ...previewUrls])
        setSuccess(demoNotice)
        return
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

      setImages((current) => {
        const nextImages = [...current]

        for (const fileUrl of data.files as string[]) {
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

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice
          ? Number(formData.compareAtPrice)
          : null,
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
        await new Promise((resolve) => setTimeout(resolve, 450))
        setSuccess(demoNotice)
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
    <div className="max-w-5xl animate-fade-in pb-12">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`${basePath}/productos`}
          className="rounded-full border border-lc-border bg-lc-dark p-2 text-lc-gray transition-colors hover:text-lc-white"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-lc-white">
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="col-span-1 space-y-8 lg:col-span-2">
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
                    Galeria de Imagenes
                  </h2>
                  <p className="mt-1 text-sm text-lc-gray">
                    La primera imagen sera la portada del producto.
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
                  {uploadingImages ? "Subiendo..." : "Anadir imagenes"}
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
                  Anadir por ruta publica o URL
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
                    className="flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Anadir
                  </Button>
                </div>
              </div>

              {images.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-lc-border bg-lc-darker/40 p-8 text-center text-sm text-lc-gray">
                  Sube una o varias imagenes, o usa una ruta publica como{" "}
                  <code>/images/retro1999.png</code>.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 p-3">
                        <Button
                          type="button"
                          size="sm"
                          variant={index === 0 ? "primary" : "secondary"}
                          onClick={() => moveImageToFront(imageUrl)}
                          disabled={index === 0}
                          className="flex-1"
                        >
                          <Star size={14} className="mr-2" />
                          {index === 0 ? "Principal" : "Hacer principal"}
                        </Button>
                        <button
                          type="button"
                          onClick={() => removeImage(imageUrl)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-lc-border text-lc-gray transition-colors hover:border-lc-error/40 hover:text-lc-error"
                          aria-label="Eliminar imagen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold font-heading text-lc-white">
                  Variantes
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addVariant}
                  className="flex items-center gap-2"
                  disabled={isBootstrapping}
                >
                  <Plus size={16} /> Anadir Variante
                </Button>
              </div>

              <div className="space-y-4">
                {variants.map((variant) => (
                  <div
                    key={variant.tempId}
                    className="relative grid grid-cols-2 gap-4 rounded-xl border border-lc-border bg-lc-darker/50 p-4 md:grid-cols-4"
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

        <div className="col-span-1 space-y-8">
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

              <Input
                label="Precio de Comparacion (Opcional)"
                type="number"
                min="0"
                placeholder="180000"
                value={formData.compareAtPrice}
                onChange={(e) =>
                  setFormData({ ...formData, compareAtPrice: e.target.value })
                }
                disabled={isBootstrapping}
              />
            </CardBody>
          </Card>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t border-lc-border pt-8 lg:col-span-3">
          <Link href={`${basePath}/productos`}>
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || uploadingImages || isBootstrapping}
            className="w-48"
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
