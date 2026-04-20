"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "No pudimos procesar tu solicitud.")
        return
      }

      setMessage(data.message)
    } catch {
      setError("Ocurrio un error inesperado. Intentalo otra vez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Correo de tu cuenta"
          type="email"
          name="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {message ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            <p>{message}</p>
            <p className="mt-2 text-xs text-emerald-200/80">
              Si estas probando en local sin SMTP, revisa la consola del servidor para ver el enlace generado.
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-lc-error/30 bg-lc-error/10 p-3 text-sm text-lc-error">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enviando enlace..." : "Enviar enlace"}
        </Button>
      </form>

      <div className="text-center text-sm text-lc-gray">
        Recordaste tu acceso?{" "}
        <Link
          href="/login"
          className="font-semibold text-lc-cyan transition-colors hover:text-white"
        >
          Volver al login
        </Link>
      </div>
    </div>
  )
}
