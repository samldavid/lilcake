"use client"

import * as React from "react"
import { ShieldAlert } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"

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
        setError("Credenciales invalidas o acceso no disponible.")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError("No pudimos iniciar sesion. Intentalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email Autorizado"
        type="email"
        name="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        placeholder="admin@lilcake.co"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Clave de Acceso"
        type="password"
        name="password"
        autoComplete="current-password"
        required
              placeholder="Ingresa tu contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error ? (
        <div className="animate-slide-up rounded-lg border border-lc-error border-opacity-30 bg-lc-error/10 p-3 text-sm text-lc-error">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        className="group mt-2 w-full bg-lc-white text-lc-black hover:bg-gray-200"
        disabled={loading}
      >
        {loading ? "Verificando credenciales..." : "Acceder al Panel"}
      </Button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lc-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="absolute -inset-1 rounded-[24px] bg-lc-white opacity-10 blur" />
        <Card className="relative z-10 w-full rounded-[20px] border border-lc-border bg-lc-dark">
          <CardHeader className="flex flex-col items-center border-b border-lc-border text-center">
            <div className="mb-4 rounded-full border border-lc-border bg-lc-darker p-3">
              <ShieldAlert className="text-lc-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-lc-white">
              Staff Portal
            </h2>
            <p className="mt-2 text-sm text-lc-gray">
              Identificate para acceder a las herramientas administrativas.
            </p>
          </CardHeader>
          <CardBody className="p-8">
            <React.Suspense
              fallback={
                <div className="p-4 text-center text-lc-gray">
                  Verificando seguridad...
                </div>
              }
            >
              <AdminLoginForm />
            </React.Suspense>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
