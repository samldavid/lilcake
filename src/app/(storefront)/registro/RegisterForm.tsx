"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { PasswordRequirements } from "@/components/auth/PasswordRequirements"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

type RegisterFormProps = {
  googleEnabled: boolean
}

export function RegisterForm({ googleEnabled }: RegisterFormProps) {
  const router = useRouter()

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })

  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al registrar usuario")
        return
      }

      router.push("/login?registered=true&verificationEmailSent=true")
    } catch {
      setError("Error inesperado en la red")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <GoogleAuthButton
        callbackUrl="/cuenta"
        label="Registrarme con Google"
        googleEnabled={googleEnabled}
        helperText="Si es tu primera vez, tu cuenta se crea automaticamente con tu perfil de Google."
      />

      <div className="flex items-center justify-center">
        <div className="h-px flex-1 bg-lc-border" />
        <span className="px-4 text-xs uppercase tracking-widest text-lc-gray">O crea tu cuenta con correo</span>
        <div className="h-px flex-1 bg-lc-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre completo"
          type="text"
          name="name"
          autoComplete="name"
          required
          placeholder="Juan Perez"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          placeholder="tu@email.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          label="Telefono (Opcional)"
          type="tel"
          name="tel"
          autoComplete="tel"
          placeholder="+57 300 000 0000"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          placeholder="Crea una contraseña segura"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <PasswordRequirements
          password={formData.password}
          identityValues={[formData.name, formData.email]}
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          placeholder="Repite tu contraseña"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
        />

        {error ? (
          <div className="animate-slide-up rounded-lg border border-lc-error border-opacity-30 bg-lc-error/10 p-3 text-sm text-lc-error">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="group mt-4 w-full" disabled={loading}>
          {loading ? (
            "Creando cuenta..."
          ) : (
            <>
              <span className="flex-1 text-center">Registrarme</span>
              <span className="transition-transform group-hover:translate-x-1">{"->"}</span>
            </>
          )}
        </Button>

        <div className="mt-6 text-center text-sm text-lc-gray">
          Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-lc-cyan transition-colors hover:text-white"
          >
            Entrar ahora
          </Link>
        </div>
      </form>
    </div>
  )
}
