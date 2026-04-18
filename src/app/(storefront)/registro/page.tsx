"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"

export default function RegisterPage() {
  const router = useRouter()
  
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
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

      router.push("/login?registered=true")
    } catch {
      setError("Error inesperado en la red")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-lc-black">
      <div className="w-full max-w-md animate-fade-in relative mt-8 mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-lc-purple to-lc-pink rounded-[24px] blur opacity-25"></div>
        <Card glass className="relative z-10 w-full rounded-[20px]">
          <CardHeader className="text-center border-b border-lc-border">
            <h2 className="text-3xl font-bold tracking-tight text-lc-white">
              Únete a LilCake
            </h2>
            <p className="mt-2 text-sm text-lc-gray">
              Crea tu cuenta para comprar de manera más rápida.
            </p>
          </CardHeader>
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre completo"
                type="text"
                required
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                required
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Teléfono (Opcional)"
                type="tel"
                placeholder="+57 300 000 0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Contraseña"
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              {error && (
                <div className="bg-lc-error/10 border border-lc-error border-opacity-30 rounded-lg p-3 text-sm text-lc-error animate-slide-up">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-4 group"
                disabled={loading}
              >
                {loading ? (
                  "Creando cuenta..."
                ) : (
                  <>
                    <span className="flex-1 text-center">Registrarme</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </Button>

              <div className="mt-6 text-center text-sm text-lc-gray">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-lc-cyan hover:text-white transition-colors"
                >
                  Entrada rápida
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
