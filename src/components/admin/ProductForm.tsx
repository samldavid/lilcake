"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImagePlus, Plus, Star, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardBody } from "@/components/ui/Card"
import {
  isValidProductImageReference,
  normalizeProductImageReference,
} from "@/lib/image-utils"

type CategoryOption = {
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

type ProductPayload = {
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

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const isEditing = Boolean(productId)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [loading, setLoading] = React.useState(false)
  const [uploadingImages, setUploadingImages] = React.useState(false)
  const [isBootstrapping, setIsBootstrapping] = React.useState(true)
  const [error, setError] = React.useState("")
  const [imageInput, setImageInput] = React.useState("")
  const [categories, setCategories] = React.useState<CategoryOption[]>([])
  const [formData, setFormData] = React.useState(initialFormData)
  const [images, setImages] = React.useState<string[]>([])
  const [variants, setVariants] = React.useState<ProductVariantDraft[]>([
    createEmptyVariant(),
  ])

  React.useEffect(() => {
    let isActive = true

    const loadForm = async () => {
      try {
        setIsBootstrapping(true)
        setError("")

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
          const productData: ProductPayload = await productResponse.json()

          if (!productResponse.ok) {
            throw new Error(productData?.name || "No pudimos cargar el producto.")
          }

          if (!isActive) {
            return
          }

          setFormData({
            name: productData.name,
            description: productData.description,
            price: String(productData.price),
            compareAtPrice: productData.compareAtPrice
              ? String(productData.compareAtPrice)
              : "",
            categoryId: productData.categoryId,
            isActive: productData.isActive,
            isFeatured: productData.isFeatured,
          })
          setImages(productData.images.map((image) => image.url))
          setVariants(
            productData.variants.length > 0
              ? productData.variants.map((variant) => ({
                  id: variant.id,
                  tempId: variant.id,
                  size: variant.size || "",
                  color: variant.color || "",
                  sku: variant.sku,
                  stock: String(variant.stock),
                }))
              : [createEmptyVariant()]
          )
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
  }, [productId])

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

      const uploadData = new FormData()

      Array.from(fileList).forEach((file) => {
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
    setImages((current) => current.filter((existingImage) => existingImage !== imageUrl))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")

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

      router.push("/admin/productos")
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
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/productos"
          className="p-2 rounded-full bg-lc-dark border border-lc-border text-lc-gray hover:text-lc-white transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-lc-white">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h1>
          <p className="text-lc-gray text-sm mt-1">
            {isEditing
              ? "Actualiza la informacion principal del producto."
              : "Completa los datos para crear un nuevo articulo."}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-lc-error/30 bg-lc-error/10 p-4 text-sm text-lc-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-8">
          <Card>
            <CardBody className="space-y-6">
              <h2 className="text-xl font-bold font-heading text-lc-white mb-4">
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
                <label className="block text-sm font-medium text-lc-gray-light mb-1.5 ml-1">
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold font-heading text-lc-white">
                    Galeria de Imagenes
                  </h2>
                  <p className="text-sm text-lc-gray mt-1">
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
                  {uploadingImages ? "Subiendo..." : "Añadir imagenes"}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelection}
              />

              <div className="rounded-2xl border border-dashed border-lc-border bg-lc-darker/40 p-4">
                <label className="block text-sm font-medium text-lc-gray-light mb-2">
                  Añadir por ruta publica o URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
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
                    Añadir
                  </Button>
                </div>
              </div>

              {images.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-lc-border bg-lc-darker/40 p-8 text-center text-sm text-lc-gray">
                  Sube una o varias imagenes, o usa una ruta publica como
                  {" "}
                  <code>/images/retro1999.png</code>.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((imageUrl, index) => (
                    <div
                      key={imageUrl}
                      className="rounded-2xl border border-lc-border bg-lc-darker/50 overflow-hidden"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden group">
                        <img
                          src={imageUrl}
                          alt={`Vista previa ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-lc-black/80 to-transparent">
                          <span className="text-xs font-bold uppercase tracking-wide text-lc-white">
                            {index === 0 ? "Portada" : `Imagen ${index + 1}`}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 flex items-center justify-between gap-2">
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
                          className="h-8 w-8 rounded-full border border-lc-border text-lc-gray hover:text-lc-error hover:border-lc-error/40 transition-colors inline-flex items-center justify-center"
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
              <div className="flex justify-between items-center mb-6">
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
                    className="relative grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-lc-border rounded-xl bg-lc-darker/50"
                  >
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.tempId)}
                      className="absolute -top-3 -right-3 p-1.5 bg-lc-error text-white rounded-full hover:bg-red-600 transition-colors z-10"
                      disabled={variants.length <= 1 || isBootstrapping}
                    >
                      <X size={14} />
                    </button>

                    <div>
                      <label className="block text-xs text-lc-gray mb-1">Talla</label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(variant.tempId, "size", e.target.value)
                        }
                        className="w-full bg-lc-dark border border-lc-border rounded-lg px-3 py-2 text-sm text-lc-white focus:border-lc-purple outline-none"
                        placeholder="S, M, L..."
                        disabled={isBootstrapping}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-lc-gray mb-1">Color</label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) =>
                          updateVariant(variant.tempId, "color", e.target.value)
                        }
                        className="w-full bg-lc-dark border border-lc-border rounded-lg px-3 py-2 text-sm text-lc-white focus:border-lc-purple outline-none"
                        placeholder="Black, White..."
                        disabled={isBootstrapping}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-lc-gray mb-1">SKU</label>
                      <input
                        type="text"
                        required
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(variant.tempId, "sku", e.target.value)
                        }
                        className="w-full bg-lc-dark border border-lc-border rounded-lg px-3 py-2 text-sm text-lc-white focus:border-lc-purple outline-none"
                        disabled={isBootstrapping}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-lc-gray mb-1">Stock</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(variant.tempId, "stock", e.target.value)
                        }
                        className="w-full bg-lc-dark border border-lc-border rounded-lg px-3 py-2 text-sm text-lc-white focus:border-lc-purple outline-none"
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
              <h2 className="text-xl font-bold font-heading text-lc-white mb-4">
                Organizacion
              </h2>

              <div>
                <label className="block text-sm font-medium text-lc-gray-light mb-1.5 ml-1">
                  Categoria
                </label>
                <select
                  required
                  className="w-full bg-lc-darker border border-lc-border rounded-xl px-4 py-3 text-sm text-lc-white focus:border-lc-purple outline-none"
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

              <div className="flex items-center justify-between p-4 bg-lc-darker rounded-xl border border-lc-border">
                <div>
                  <div className="font-bold text-sm text-lc-white">Estado Activo</div>
                  <div className="text-xs text-lc-gray">Visible en la tienda</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="sr-only peer"
                    disabled={isBootstrapping}
                  />
                  <div className="w-11 h-6 bg-lc-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lc-success"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-lc-darker rounded-xl border border-lc-border">
                <div>
                  <div className="font-bold text-sm text-lc-purple-light">
                    Drop Exclusivo
                  </div>
                  <div className="text-xs text-lc-gray">Mostrar en portada</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="sr-only peer"
                    disabled={isBootstrapping}
                  />
                  <div className="w-11 h-6 bg-lc-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lc-purple"></div>
                </label>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-6">
              <h2 className="text-xl font-bold font-heading text-lc-white mb-4">
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

        <div className="lg:col-span-3 flex justify-end gap-4 mt-8 pt-8 border-t border-lc-border">
          <Link href="/admin/productos">
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || uploadingImages || isBootstrapping}
            className="w-48"
          >
            {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </div>
  )
}
