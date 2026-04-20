import { NextResponse } from "next/server"
import { verifyEmailWithToken } from "@/lib/account-security"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  const redirectUrl = new URL("/verificar-correo", req.url)

  if (!token) {
    redirectUrl.searchParams.set("status", "invalid")
    return NextResponse.redirect(redirectUrl)
  }

  const result = await verifyEmailWithToken(token)
  redirectUrl.searchParams.set("status", result.success ? "success" : "invalid")

  return NextResponse.redirect(redirectUrl)
}
