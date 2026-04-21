import { Prisma } from "@prisma/client"

type PublicErrorOptions = {
  fallbackMessage?: string
}

export function getPublicErrorMessage(
  error: unknown,
  options: PublicErrorOptions = {}
) {
  const fallbackMessage =
    options.fallbackMessage ?? "Error interno del servidor."

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return "Ya existe un registro con uno de los valores enviados."
      case "P2003":
        return "No pudimos completar la operación porque hay datos relacionados."
      case "P2025":
        return "No encontramos el registro solicitado."
      default:
        return fallbackMessage
    }
  }

  return fallbackMessage
}
