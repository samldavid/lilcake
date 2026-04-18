export function isValidProductImageReference(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return false
  }

  if (trimmedValue.startsWith("/")) {
    return true
  }

  try {
    const url = new URL(trimmedValue)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function normalizeProductImageReference(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return trimmedValue
  }

  if (trimmedValue.startsWith("/")) {
    return trimmedValue.replace(/\/{2,}/g, "/")
  }

  return trimmedValue
}
