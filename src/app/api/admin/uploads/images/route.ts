import path from "path"
import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import { NextResponse } from "next/server"

const MAX_FILE_SIZE = 8 * 1024 * 1024

function sanitizeFilename(fileName: string) {
  const extension = path.extname(fileName) || ".png"
  const baseName = path
    .basename(fileName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 40)

  return `${baseName || "image"}-${randomUUID().slice(0, 8)}${extension.toLowerCase()}`
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const files = formData
      .getAll("files")
      .filter((file): file is File => file instanceof File && file.size > 0)

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No recibimos archivos para subir." },
        { status: 400 }
      )
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
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
    }

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products"
    )
    await mkdir(uploadDirectory, { recursive: true })

    const uploadedFiles: string[] = []

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const fileName = sanitizeFilename(file.name)
      const outputPath = path.join(uploadDirectory, fileName)

      await writeFile(outputPath, Buffer.from(arrayBuffer))
      uploadedFiles.push(`/uploads/products/${fileName}`)
    }

    return NextResponse.json({ files: uploadedFiles })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos subir las imagenes."

    console.error("Image upload error:", error)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
