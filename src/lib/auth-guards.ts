import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function getCurrentSession() {
  return getServerSession(authOptions)
}

export async function requireAdminPageAccess() {
  const session = await getCurrentSession()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    notFound()
  }

  return session
}

export async function requireAdminApiSession() {
  const session = await getCurrentSession()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null
  }

  return session
}

export function adminNotFoundResponse() {
  return NextResponse.json({ error: "Not Found" }, { status: 404 })
}
