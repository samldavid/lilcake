"use client"

import * as React from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

type LoginFormProps = {
  googleEnabled: boolean
}

function getAuthErrorMessage(errorCode: string) {
  switch (errorCode) {
    case "OAuthAccountNotLinked":
      return "Ya existe una cuenta con este correo usando otro metodo de acceso."
    case "AccessDenied":
      return "Google no autorizo el acceso a la aplicacion."
    case "Configuration":
      return "Google Login todavia no esta configurado en este entorno."
    default:
      return "No se pudo iniciar sesion con Google. Intentalo de nuevo."
  }
}

export function LoginForm({ googleEnabled }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const googleError = searchParams.get("error")
  const registered = searchParams.get("registered") === "true"

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!googleError) return
    setError(getAuthErrorMessage(googleError))
  }, [googleError])

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
      setError("Error inesperado al iniciar sesion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {registered ? (
        <div className="mb-5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          Tu cuenta fue creada. Ya puedes entrar con tu correo o con Google.
        </div>
      ) : null}

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
          label="Contrasena"
          type="password"
          required
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error ? (
          <div className="animate-slide-up rounded-lg border border-lc-error border-opacity-30 bg-lc-error/10 p-3 text-sm text-lc-error">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="group mt-2 w-full" disabled={loading}>
          {loading ? (
            "Iniciando..."
          ) : (
            <>
              <span className="flex-1 text-center">Entrar con Correo</span>
              <span className="transition-transform group-hover:translate-x-1">{"->"}</span>
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center">
        <div className="h-px flex-1 bg-lc-border" />
        <span className="px-4 text-xs uppercase tracking-widest text-lc-gray">O continua con</span>
        <div className="h-px flex-1 bg-lc-border" />
      </div>

      <GoogleAuthButton
        className="mt-6"
        callbackUrl={callbackUrl}
        label="Ingresar con Google"
        googleEnabled={googleEnabled}
      />

      <div className="mt-8 text-center text-sm text-lc-gray">
        No tienes cuenta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-lc-pink transition-colors hover:text-white"
        >
          Registrate aqui
        </Link>
      </div>
    </div>
  )
}
