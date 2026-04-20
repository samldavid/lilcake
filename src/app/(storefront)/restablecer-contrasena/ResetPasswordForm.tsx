"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PasswordRequirements } from "@/components/auth/PasswordRequirements"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

type ResetPasswordFormProps = {
  token: string
  mode?: string
}

export function ResetPasswordForm({ token, mode }: ResetPasswordFormProps) {
  const router = useRouter()
  const isAccountChangeFlow = mode === "account-change"
  const [formData, setFormData] = React.useState({
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "No pudimos restablecer tu contraseña.")
        return
      }

      router.push("/login?reset=true")
    } catch {
      setError("Ocurrió un error inesperado. Inténtalo otra vez.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-lc-error/30 bg-lc-error/10 p-3 text-sm text-lc-error">
          El enlace no es válido. Solicita uno nuevo para continuar.
        </div>
        <Link
          href="/recuperar-contrasena"
          className="inline-flex text-sm font-semibold text-lc-cyan transition-colors hover:text-white"
        >
          Solicitar un nuevo enlace
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-lc-border bg-lc-darker/60 p-4 text-sm text-lc-gray-light">
        {isAccountChangeFlow
          ? "Confirmaste el cambio desde tu correo. Ahora define tu nueva contraseña."
          : "Usa este formulario para definir una nueva contraseña segura."}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nueva contraseña"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          placeholder="Escribe una contraseña segura"
          value={formData.password}
          onChange={(e) =>
            setFormData((current) => ({
              ...current,
              password: e.target.value,
            }))
          }
        />

        <PasswordRequirements password={formData.password} />

        <Input
          label="Confirmar contraseña"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          placeholder="Repite la contraseña"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData((current) => ({
              ...current,
              confirmPassword: e.target.value,
            }))
          }
        />

        {error ? (
          <div className="rounded-lg border border-lc-error/30 bg-lc-error/10 p-3 text-sm text-lc-error">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Guardando..." : "Guardar nueva contraseña"}
        </Button>
      </form>

      <div className="text-center text-sm text-lc-gray">
        Prefieres volver?{" "}
        <Link
          href="/login"
          className="font-semibold text-lc-cyan transition-colors hover:text-white"
        >
          Ir al login
        </Link>
      </div>
    </div>
  )
}
