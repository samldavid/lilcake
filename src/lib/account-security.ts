import bcrypt from "bcryptjs"
import { createHash, randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { getPasswordValidationErrors } from "@/lib/password-policy"
import { buildBrandedEmailHtml, sendBrandedMail } from "@/lib/mail"

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "LilCake"
const PASSWORD_RESET_WINDOW_MS = 1000 * 60 * 60
const EMAIL_VERIFICATION_WINDOW_MS = 1000 * 60 * 60 * 24

type AccountSecurityTokenType = "PASSWORD_RESET" | "EMAIL_VERIFICATION"
type PasswordEmailMode = "forgot-password" | "account-change"

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "")
}

function getTokenExpiry(type: AccountSecurityTokenType) {
  return new Date(
    Date.now() +
      (type === "PASSWORD_RESET"
        ? PASSWORD_RESET_WINDOW_MS
        : EMAIL_VERIFICATION_WINDOW_MS)
  )
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

function buildAbsoluteUrl(path: string) {
  return `${getAppUrl()}${path.startsWith("/") ? path : `/${path}`}`
}

function buildPasswordResetUrl(rawToken: string, mode: PasswordEmailMode) {
  const searchParams = new URLSearchParams({
    token: rawToken,
    mode,
  })

  return buildAbsoluteUrl(`/restablecer-contrasena?${searchParams.toString()}`)
}

function buildEmailText({
  recipientName,
  intro,
  actionLabel,
  actionUrl,
  footer,
}: {
  recipientName: string
  intro: string
  actionLabel: string
  actionUrl: string
  footer: string
}) {
  return [
    `Hola ${recipientName},`,
    "",
    intro,
    "",
    `${actionLabel}:`,
    actionUrl,
    "",
    footer,
  ].join("\n")
}

async function createAccountSecurityToken(
  userId: string,
  type: AccountSecurityTokenType
) {
  const rawToken = randomBytes(32).toString("hex")
  const tokenHash = hashToken(rawToken)
  const expiresAt = getTokenExpiry(type)

  await prisma.$transaction([
    prisma.accountSecurityToken.deleteMany({
      where: {
        userId,
        type,
      },
    }),
    prisma.accountSecurityToken.create({
      data: {
        userId,
        type,
        tokenHash,
        expiresAt,
      },
    }),
  ])

  return {
    rawToken,
    expiresAt,
  }
}

async function getValidAccountSecurityToken(
  rawToken: string,
  type: AccountSecurityTokenType
) {
  const tokenHash = hashToken(rawToken)
  const tokenRecord = await prisma.accountSecurityToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          password: true,
        },
      },
    },
  })

  if (!tokenRecord || tokenRecord.type !== type) {
    return null
  }

  if (tokenRecord.usedAt || tokenRecord.expiresAt < new Date()) {
    return null
  }

  return tokenRecord
}

async function sendPasswordLinkEmail({
  user,
  mode,
}: {
  user: {
    id: string
    name: string | null
    email: string
    emailVerified?: Date | null
  }
  mode: PasswordEmailMode
}) {
  const { rawToken } = await createAccountSecurityToken(
    user.id,
    "PASSWORD_RESET"
  )

  const resetUrl = buildPasswordResetUrl(rawToken, mode)
  const recipientName = user.name?.trim() || "cliente"
  const isAccountChange = mode === "account-change"

  const subject = isAccountChange
    ? `${APP_NAME}: confirma el cambio de tu contraseña`
    : `${APP_NAME}: restablece tu contraseña`

  const intro = isAccountChange
    ? "Recibimos una solicitud desde tu cuenta para cambiar la contraseña."
    : "Recibimos una solicitud para restablecer tu contraseña."

  const actionLabel = isAccountChange
    ? "Abre este enlace temporal para cambiar tu contraseña"
    : "Abre este enlace durante la próxima hora"

  const footer = isAccountChange
    ? "Si no fuiste tú, puedes ignorar este mensaje y tu contraseña actual seguirá igual."
    : "Si no fuiste tú, puedes ignorar este mensaje y tu cuenta seguirá igual."

  await sendBrandedMail({
    to: user.email,
    subject,
    text: buildEmailText({
      recipientName,
      intro,
      actionLabel,
      actionUrl: resetUrl,
      footer,
    }),
    html: buildBrandedEmailHtml({
      preheader: isAccountChange
        ? "Confirma el cambio de tu contraseña en LilCake"
        : "Restablece tu contraseña de LilCake",
      eyebrow: "Seguridad de cuenta",
      title: isAccountChange
        ? "Cambia tu contraseña"
        : "Restablece tu contraseña",
      intro: isAccountChange
        ? `Hola ${recipientName}, confirma por correo que realmente quieres cambiar la contraseña de tu cuenta.`
        : `Hola ${recipientName}, tenemos listo tu enlace seguro para recuperar el acceso.`,
      body: isAccountChange
        ? [
            "Por seguridad, te enviamos este enlace temporal al correo verificado de tu cuenta.",
            "El botón te llevará directamente al formulario para crear tu nueva contraseña y vencerá dentro de la próxima hora.",
          ]
        : [
            "Recibimos una solicitud para restablecer la contraseña de tu cuenta.",
            "Este enlace solo funcionará durante la próxima hora y luego dejará de ser válido por seguridad.",
          ],
      action: {
        href: resetUrl,
        label: isAccountChange
          ? "Confirmar y cambiar contraseña"
          : "Crear una nueva contraseña",
      },
      footerNote: isAccountChange
        ? "Si no reconoces esta solicitud, puedes ignorar este correo sin hacer cambios en tu cuenta."
        : "Si no reconoces esta solicitud, puedes ignorar este correo sin hacer cambios en tu cuenta.",
    }),
    branded: {
      preheader: isAccountChange
        ? "Confirma el cambio de tu contraseña en LilCake"
        : "Restablece tu contraseña de LilCake",
      eyebrow: "Seguridad de cuenta",
      title: isAccountChange
        ? "Cambia tu contraseña"
        : "Restablece tu contraseña",
      intro: isAccountChange
        ? `Hola ${recipientName}, confirma por correo que realmente quieres cambiar la contraseña de tu cuenta.`
        : `Hola ${recipientName}, tenemos listo tu enlace seguro para recuperar el acceso.`,
      body: isAccountChange
        ? [
            "Por seguridad, te enviamos este enlace temporal al correo verificado de tu cuenta.",
            "El botón te llevará directamente al formulario para crear tu nueva contraseña y vencerá dentro de la próxima hora.",
          ]
        : [
            "Recibimos una solicitud para restablecer la contraseña de tu cuenta.",
            "Este enlace solo funcionará durante la próxima hora y luego dejará de ser válido por seguridad.",
          ],
      action: {
        href: resetUrl,
        label: isAccountChange
          ? "Confirmar y cambiar contraseña"
          : "Crear una nueva contraseña",
      },
      footerNote: isAccountChange
        ? "Si no reconoces esta solicitud, puedes ignorar este correo sin hacer cambios en tu cuenta."
        : "Si no reconoces esta solicitud, puedes ignorar este correo sin hacer cambios en tu cuenta.",
    },
  })
}

export async function sendPasswordResetEmail(email: string) {
  const normalizedEmail = email.toLowerCase().trim()

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  if (!user?.email) {
    return { success: true }
  }

  await sendPasswordLinkEmail({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: null,
    },
    mode: "forgot-password",
  })

  return { success: true }
}

export async function sendPasswordChangeEmailForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
    },
  })

  if (!user?.email) {
    return {
      success: false as const,
      error: "Tu cuenta no tiene un correo disponible para esta verificación.",
    }
  }

  if (!user.emailVerified) {
    return {
      success: false as const,
      error:
        "Primero debes verificar tu correo antes de cambiar la contraseña.",
    }
  }

  await sendPasswordLinkEmail({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    },
    mode: "account-change",
  })

  return {
    success: true as const,
    message:
      "Te enviamos un enlace temporal a tu correo verificado para cambiar la contraseña.",
  }
}

export async function sendEmailVerificationEmailForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
    },
  })

  if (!user?.email || user.emailVerified) {
    return { success: true }
  }

  const { rawToken } = await createAccountSecurityToken(
    user.id,
    "EMAIL_VERIFICATION"
  )

  const verifyUrl = buildAbsoluteUrl(
    `/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`
  )
  const recipientName = user.name?.trim() || "cliente"

  await sendBrandedMail({
    to: user.email,
    subject: `${APP_NAME}: verifica tu correo`,
    text: buildEmailText({
      recipientName,
      intro:
        "Confirma tu correo para reforzar la seguridad de tu cuenta y mantener tus accesos al dia.",
      actionLabel: "Usa este enlace durante las proximas 24 horas",
      actionUrl: verifyUrl,
      footer:
        "Si no reconoces este mensaje, puedes ignorarlo sin problema.",
    }),
    html: buildBrandedEmailHtml({
      preheader: "Confirma tu correo en LilCake",
      eyebrow: "Verificación de correo",
      title: "Confirma tu correo",
      intro: `Hola ${recipientName}, queremos dejar tu cuenta bien protegida desde el primer acceso.`,
      body: [
        "Confirma tu correo para reforzar la seguridad de tu cuenta y mantener tus accesos al dia.",
        "El botón te llevará directamente a la página de verificación y el enlace vencerá dentro de las próximas 24 horas.",
      ],
      action: {
        href: verifyUrl,
        label: "Confirmar correo",
      },
      footerNote:
        "Si no reconoces este mensaje, puedes ignorarlo sin problema. No se hara ningun cambio hasta que abras el enlace.",
    }),
    branded: {
      preheader: "Confirma tu correo en LilCake",
      eyebrow: "Verificación de correo",
      title: "Confirma tu correo",
      intro: `Hola ${recipientName}, queremos dejar tu cuenta bien protegida desde el primer acceso.`,
      body: [
        "Confirma tu correo para reforzar la seguridad de tu cuenta y mantener tus accesos al dia.",
        "El botón te llevará directamente a la página de verificación y el enlace vencerá dentro de las próximas 24 horas.",
      ],
      action: {
        href: verifyUrl,
        label: "Confirmar correo",
      },
      footerNote:
        "Si no reconoces este mensaje, puedes ignorarlo sin problema. No se hara ningun cambio hasta que abras el enlace.",
    },
  })

  return { success: true }
}

export async function verifyEmailWithToken(rawToken: string) {
  const tokenRecord = await getValidAccountSecurityToken(
    rawToken,
    "EMAIL_VERIFICATION"
  )

  if (!tokenRecord) {
    return {
      success: false as const,
      error: "El enlace de verificación no es válido o ya venció.",
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: {
        emailVerified: tokenRecord.user.emailVerified || new Date(),
      },
    }),
    prisma.accountSecurityToken.update({
      where: { id: tokenRecord.id },
      data: {
        usedAt: new Date(),
      },
    }),
  ])

  return { success: true as const }
}

export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string
) {
  const tokenRecord = await getValidAccountSecurityToken(
    rawToken,
    "PASSWORD_RESET"
  )

  if (!tokenRecord) {
    return {
      success: false as const,
      error: "El enlace para restablecer la contraseña no es válido o ya venció.",
    }
  }

  const passwordErrors = getPasswordValidationErrors(newPassword, [
    tokenRecord.user.name,
    tokenRecord.user.email,
  ])

  if (passwordErrors.length > 0) {
    return {
      success: false as const,
      error: passwordErrors[0],
    }
  }

  if (tokenRecord.user.password) {
    const isSamePassword = await bcrypt.compare(
      newPassword,
      tokenRecord.user.password
    )

    if (isSamePassword) {
      return {
        success: false as const,
        error: "La nueva contraseña debe ser diferente a la anterior.",
      }
    }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: {
        password: hashedPassword,
        emailVerified: tokenRecord.user.emailVerified || new Date(),
      },
    }),
    prisma.accountSecurityToken.update({
      where: { id: tokenRecord.id },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.accountSecurityToken.deleteMany({
      where: {
        userId: tokenRecord.userId,
        type: "PASSWORD_RESET",
        id: {
          not: tokenRecord.id,
        },
      },
    }),
  ])

  return {
    success: true as const,
    message:
      "Tu contraseña fue actualizada. Ya puedes entrar con tu nuevo acceso.",
  }
}
