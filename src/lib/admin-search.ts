export function normalizeAdminSearchValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
}

export function tokenizeAdminSearch(value: string) {
  return normalizeAdminSearchValue(value)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
}

export function scoreAdminSearchMatch(
  query: string,
  values: Array<string | null | undefined>
) {
  const normalizedQuery = normalizeAdminSearchValue(query)

  if (!normalizedQuery) {
    return 1
  }

  const tokens = tokenizeAdminSearch(query)
  const haystackValues = values
    .map((value) => normalizeAdminSearchValue(value))
    .filter(Boolean)

  if (haystackValues.length === 0) {
    return 0
  }

  let score = 0

  haystackValues.forEach((value) => {
    if (value === normalizedQuery) {
      score += 120
    } else if (value.startsWith(normalizedQuery)) {
      score += 70
    } else if (value.includes(normalizedQuery)) {
      score += 36
    }

    tokens.forEach((token) => {
      if (!token) return

      if (value === token) {
        score += 26
      } else if (value.startsWith(token)) {
        score += 18
      } else if (value.includes(token)) {
        score += 10
      }
    })
  })

  const missingToken = tokens.some(
    (token) => !haystackValues.some((value) => value.includes(token))
  )

  if (missingToken) {
    return 0
  }

  return score
}
