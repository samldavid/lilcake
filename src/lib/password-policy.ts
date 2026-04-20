export const PASSWORD_MIN_LENGTH = 6

export const PASSWORD_REQUIREMENT_LABELS = {
  minLength: `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`,
  uppercase: "Al menos una letra mayúscula",
  lowercase: "Al menos una letra minúscula",
  number: "Al menos un número",
  symbol: "Al menos un símbolo",
  excludesIdentity: "No debe incluir tu nombre o correo",
} as const

function normalizeIdentityValue(value?: string | null) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
}

export function getPasswordRuleChecks(password: string) {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }
}

export function passwordContainsIdentity(
  password: string,
  identityValues: Array<string | null | undefined>
) {
  const normalizedPassword = password.toLowerCase()
  const compactPassword = password.toLowerCase().replace(/[^a-z0-9]/g, "")

  return identityValues.some((value) => {
    const normalizedValue = normalizeIdentityValue(value)

    return Boolean(
      normalizedValue &&
        normalizedValue.length >= 3 &&
        (normalizedPassword.includes(normalizedValue) ||
          compactPassword.includes(normalizedValue))
    )
  })
}

export function getPasswordValidationErrors(
  password: string,
  identityValues: Array<string | null | undefined> = []
) {
  const checks = getPasswordRuleChecks(password)
  const errors: string[] = []

  if (!checks.minLength) {
    errors.push(PASSWORD_REQUIREMENT_LABELS.minLength)
  }

  if (!checks.uppercase) {
    errors.push(PASSWORD_REQUIREMENT_LABELS.uppercase)
  }

  if (!checks.lowercase) {
    errors.push(PASSWORD_REQUIREMENT_LABELS.lowercase)
  }

  if (!checks.number) {
    errors.push(PASSWORD_REQUIREMENT_LABELS.number)
  }

  if (!checks.symbol) {
    errors.push(PASSWORD_REQUIREMENT_LABELS.symbol)
  }

  if (passwordContainsIdentity(password, identityValues)) {
    errors.push(PASSWORD_REQUIREMENT_LABELS.excludesIdentity)
  }

  return errors
}
