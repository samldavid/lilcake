"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2, "El nombre debe ser más largo"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
})

export async function updateUserProfile(data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return { success: false, error: "No autorizado" }
    }

    // Only customers are expected to use this, but we allow anyone authenticated.
    
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
      }
    })

    return { success: true }
    
  } catch (error) {
    console.error("Error updating profile", error)
    return { success: false, error: "Error de servidor al guardar los datos" }
  }
}
