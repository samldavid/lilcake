import path from "path"
import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import {
  adminNotFoundResponse,
  requireAdminApiSession,
} from "@/lib/auth-guards"
import { getPublicErrorMessage } from "@/lib/errors"

const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])
const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".jfif",
  ".png",
  ".webp",
  ".gif",
  ".avif",
])

type AllowedImageType = {
  extension: ".jpg" | ".png" | ".webp" | ".gif" | ".avif"
  mime: "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "image/avif"
}

function isUploadedFile(entry: FormDataEntryValue): entry is File {
  if (typeof entry !== "object" || entry === null) {
    return false
  }

  const file = entry as Partial<File>

  return (
    typeof file.name === "string" &&
    typeof file.type === "string" &&
    typeof file.size === "number" &&
    file.size > 0 &&
    typeof file.arrayBuffer === "function"
  )
}

function detectImageType(buffer: Uint8Array): AllowedImageType | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { extension: ".jpg", mime: "image/jpeg" }
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { extension: ".png", mime: "image/png" }
  }

  if (
    buffer.length >= 12 &&
    String.fromCharCode(...buffer.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...buffer.slice(8, 12)) === "WEBP"
  ) {
    return { extension: ".webp", mime: "image/webp" }
  }

  if (
    buffer.length >= 6 &&
    (String.fromCharCode(...buffer.slice(0, 6)) === "GIF87a" ||
      String.fromCharCode(...buffer.slice(0, 6)) === "GIF89a")
  ) {
    return { extension: ".gif", mime: "image/gif" }
  }

  if (
    buffer.length >= 12 &&
    String.fromCharCode(...buffer.slice(4, 8)) === "ftyp" &&
    String.fromCharCode(...buffer.slice(8, 12)).startsWith("avif")
  ) {
    return { extension: ".avif", mime: "image/avif" }
  }

  return null
}

function normalizeExtension(extension: string) {
  return extension === ".jpeg" || extension === ".jfif" ? ".jpg" : extension
}

function isAllowedProductBlobPathname(pathname: string) {
  if (!pathname.startsWith("products/")) {
    return false
  }

  const extension = normalizeExtension(path.extname(pathname).toLowerCase())
  return ALLOWED_EXTENSIONS.has(extension)
}

function sanitizeFilename(fileName: string, extension: AllowedImageType["extension"]) {
  const currentExtension = path.extname(fileName)
  const baseName = path
    .basename(fileName, currentExtension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 40)

  return `${baseName || "image"}-${randomUUID().slice(0, 8)}${extension}`
}

async function uploadProductImage(
  fileName: string,
  fileBuffer: Buffer,
  mime: AllowedImageType["mime"]
) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${fileName}`, fileBuffer, {
      access: "public",
      contentType: mime,
      addRandomSuffix: false,
    })

    return blob.url
  }

  if (process.env.VERCEL) {
    throw new Error(
      "El almacenamiento de imagenes no esta configurado en Vercel. Conecta Vercel Blob para habilitar subidas en produccion."
    )
  }

  const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "products"
  )
  await mkdir(uploadDirectory, { recursive: true })

  const outputPath = path.join(uploadDirectory, fileName)
  await writeFile(outputPath, fileBuffer)

  return `/uploads/products/${fileName}`
}

export async function POST(req: Request) {
  try {
    const session = await requireAdminApiSession()

    if (!session) {
      return adminNotFoundResponse()
    }

    const contentType = req.headers.get("content-type") ?? ""

    if (contentType.includes("application/json")) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          {
            error:
              "BLOB_CLIENT_UPLOAD_UNAVAILABLE: Vercel Blob no esta configurado para subidas directas.",
          },
          { status: 501 }
        )
      }

      const body = (await req.json()) as HandleUploadBody

      if (body.type !== "blob.generate-client-token") {
        return NextResponse.json(
          { error: "Tipo de subida no permitido." },
          { status: 400 }
        )
      }

      const jsonResponse = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          if (!isAllowedProductBlobPathname(pathname)) {
            throw new Error("La ruta del archivo no esta permitida.")
          }

          return {
            allowedContentTypes: Array.from(ALLOWED_MIME_TYPES),
            maximumSizeInBytes: MAX_FILE_SIZE,
            addRandomSuffix: false,
            allowOverwrite: false,
            tokenPayload: clientPayload,
          }
        },
      })

      return NextResponse.json(jsonResponse)
    }

    const formData = await req.formData()
    const files = formData.getAll("files").filter(isUploadedFile)

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No recibimos archivos para subir." },
        { status: 400 }
      )
    }

    const uploadedFiles: string[] = []

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `El archivo ${file.name} no es una imagen valida.` },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `La imagen ${file.name} supera el limite de 8 MB.`,
          },
          { status: 400 }
        )
      }

      const originalExtension = normalizeExtension(path.extname(file.name).toLowerCase())

      if (!ALLOWED_EXTENSIONS.has(originalExtension)) {
        return NextResponse.json(
          {
            error: `La extension ${originalExtension || "(sin extension)"} no esta permitida.`,
          },
          { status: 400 }
        )
      }

      const arrayBuffer = await file.arrayBuffer()
      const fileBuffer = Buffer.from(arrayBuffer)
      const detectedImageType = detectImageType(fileBuffer)

      if (!detectedImageType) {
        return NextResponse.json(
          {
            error: `No pudimos validar el formato real de ${file.name}.`,
          },
          { status: 400 }
        )
      }

      if (detectedImageType.extension !== originalExtension) {
        return NextResponse.json(
          {
            error: `La extension de ${file.name} no coincide con su contenido real.`,
          },
          { status: 400 }
        )
      }

      const fileName = sanitizeFilename(file.name, detectedImageType.extension)
      const fileUrl = await uploadProductImage(
        fileName,
        fileBuffer,
        detectedImageType.mime
      )

      uploadedFiles.push(fileUrl)
    }

    return NextResponse.json({ files: uploadedFiles })
  } catch (error) {
    console.error("Image upload error:", error)
    const isStorageConfigurationError =
      error instanceof Error &&
      error.message.startsWith("El almacenamiento de imagenes no esta configurado")

    return NextResponse.json(
      {
        error: isStorageConfigurationError
          ? error.message
          : getPublicErrorMessage(error, {
              fallbackMessage: "No pudimos subir las imagenes.",
            }),
      },
      { status: isStorageConfigurationError ? 503 : 500 }
    )
  }
}
