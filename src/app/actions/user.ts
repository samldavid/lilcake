"use server"

import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { changePasswordSchema } from "@/lib/validations"
import { getPasswordValidationErrors } from "@/lib/password-policy"

const updateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe ser mas largo"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
})

export async function updateUserProfile(data: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" }
    }

    const parse = updateProfileSchema.safeParse({
      name: data.get("name"),
      phone: data.get("phone"),
      address: data.get("address"),
      city: data.get("city"),
    })

    if (!parse.success) {
      return { success: false, error: "Datos inválidos" }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parse.data.name,
        phone: parse.data.phone || null,
        address: parse.data.address || null,
        city: parse.data.city || null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating profile", error)
    return { success: false, error: "Error de servidor al guardar los datos" }
  }
}

export async function updateUserPassword(data: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    })

    if (!user) {
      return { success: false, error: "No encontramos tu cuenta." }
    }

    const parse = changePasswordSchema.safeParse({
      currentPassword: String(data.get("currentPassword") ?? ""),
      newPassword: String(data.get("newPassword") ?? ""),
      confirmPassword: String(data.get("confirmPassword") ?? ""),
    })

    if (!parse.success) {
      return {
        success: false,
        error: parse.error.issues[0]?.message || "Datos inválidos",
      }
    }

    const { currentPassword, newPassword } = parse.data
    const passwordPolicyErrors = getPasswordValidationErrors(newPassword, [
      user.name,
      user.email,
    ])

    if (passwordPolicyErrors.length > 0) {
      return { success: false, error: passwordPolicyErrors[0] }
    }

    if (user.password) {
      if (!currentPassword) {
        return {
          success: false,
          error: "Debes escribir tu contraseña actual para continuar.",
        }
      }

      const currentPasswordMatch = await bcrypt.compare(
        currentPassword,
        user.password
      )

      if (!currentPasswordMatch) {
        return {
          success: false,
          error: "La contraseña actual no coincide con tu cuenta.",
        }
      }

      const isReusingCurrentPassword = await bcrypt.compare(
        newPassword,
        user.password
      )

      if (isReusingCurrentPassword) {
        return {
          success: false,
          error: "La nueva contraseña debe ser diferente a la actual.",
        }
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    })

    return {
      success: true,
      message: user.password
        ? "Tu contraseña fue actualizada correctamente."
        : "Tu contraseña fue creada correctamente. Ya puedes entrar con correo y contraseña.",
    }
  } catch (error) {
    console.error("Error updating password", error)
    return {
      success: false,
      error: "Error de servidor al actualizar la contraseña.",
    }
  }
}
