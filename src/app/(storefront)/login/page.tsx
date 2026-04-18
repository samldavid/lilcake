"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"

// Simple SVG for Google Logo
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  
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
        // En un caso real, aquí podrías invocar fetch("/api/cart/sync", { method: "POST" })
        // para asegurar que el carrito se envíe a la BD justo después de iniciar sesión.
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError("Error inesperado al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl })
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          required
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Contraseña"
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
          className="w-full mt-2 group"
          disabled={loading}
        >
          {loading ? (
            "Iniciando..."
          ) : (
            <>
              <span className="flex-1 text-center">Entrar con Correo</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center">
        <div className="h-px bg-lc-border flex-1"></div>
        <span className="px-4 text-xs text-lc-gray uppercase tracking-widest">O continúa con</span>
        <div className="h-px bg-lc-border flex-1"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        type="button"
        className="mt-6 w-full flex items-center justify-center gap-3 bg-white text-black px-4 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
      >
        <GoogleIcon />
        <span>Ingresar con Google</span>
      </button>

      <div className="mt-8 text-center text-sm text-lc-gray">
        ¿No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-lc-pink hover:text-white transition-colors"
        >
          Regístrate aquí
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-lc-black">
      <div className="w-full max-w-md animate-fade-in relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-lc-purple to-lc-pink rounded-[24px] blur opacity-25"></div>
        <Card glass className="relative z-10 w-full rounded-[20px]">
          <CardHeader className="text-center border-b border-lc-border">
            <h2 className="text-3xl font-bold tracking-tight text-lc-white">
              Bienvenido de vuelta
            </h2>
            <p className="mt-2 text-sm text-lc-gray">
              Inicia sesión para continuar en <span className="text-lc-purple font-semibold">LilCake 🎂</span>
            </p>
          </CardHeader>
          <CardBody className="p-8">
            <React.Suspense fallback={<div className="text-center text-lc-gray p-4">Cargando...</div>}>
              <LoginForm />
            </React.Suspense>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
