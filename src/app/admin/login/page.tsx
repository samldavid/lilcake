"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { ShieldAlert } from "lucide-react"

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"
  
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError(res.error)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError("Error inesperado al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email Autorizado"
        type="email"
        required
        placeholder="admin@lilcake.co"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Clave de Acceso"
        type="password"
        required
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <div className="bg-lc-error/10 border border-lc-error border-opacity-30 rounded-lg p-3 text-sm text-lc-error animate-slide-up">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full mt-2 group bg-lc-white text-lc-black hover:bg-gray-200"
        disabled={loading}
      >
        {loading ? "Verificando Credenciales..." : "Acceder al Panel"}
      </Button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-lc-black">
      <div className="w-full max-w-md animate-fade-in relative">
        <div className="absolute -inset-1 bg-lc-white rounded-[24px] blur opacity-10"></div>
        <Card className="relative z-10 w-full rounded-[20px] bg-lc-dark border border-lc-border">
          <CardHeader className="text-center border-b border-lc-border flex flex-col items-center">
            <div className="bg-lc-darker p-3 rounded-full border border-lc-border mb-4">
              <ShieldAlert className="text-lc-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-lc-white">
              Staff Portal
            </h2>
            <p className="mt-2 text-sm text-lc-gray">
              Identifícate para acceder a las herramientas administrativas.
            </p>
          </CardHeader>
          <CardBody className="p-8">
            <React.Suspense fallback={<div className="text-center text-lc-gray p-4">Verificando seguridad...</div>}>
              <AdminLoginForm />
            </React.Suspense>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
