"use client"

import * as React from "react"
import { LogOut, ShieldCheck } from "lucide-react"
import { signOut } from "next-auth/react"
import { updateUserProfile } from "@/app/actions/user"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface UserData {
  name: string
  email: string
  emailVerified: boolean
  phone: string | null
  address: string | null
  city: string | null
  hasPassword: boolean
  hasGoogleAccount: boolean
}

export function ProfileForm({ user }: { user: UserData }) {
  const [loading, setLoading] = React.useState(false)
  const [passwordFlowOpen, setPasswordFlowOpen] = React.useState(false)
  const [passwordLoading, setPasswordLoading] = React.useState(false)
  const [verificationLoading, setVerificationLoading] = React.useState(false)
  const [msg, setMsg] = React.useState<{
    type: "error" | "success"
    text: string
  } | null>(null)
  const [verificationMsg, setVerificationMsg] = React.useState<{
    type: "error" | "success"
    text: string
  } | null>(null)
  const [passwordMsg, setPasswordMsg] = React.useState<{
    type: "error" | "success"
    text: string
  } | null>(null)

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const formData = new FormData(e.currentTarget)
    const res = await updateUserProfile(formData)

    if (res.success) {
      setMsg({ type: "success", text: "Datos actualizados correctamente." })
    } else {
      setMsg({ type: "error", text: res.error || "Hubo un error." })
    }

    setLoading(false)
  }

  const handlePasswordChangeRequest = async () => {
    setPasswordLoading(true)
    setPasswordMsg(null)

    try {
      const response = await fetch("/api/auth/request-password-change", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        setPasswordMsg({
          type: "error",
          text:
            data.error || "No pudimos enviar el correo para cambiar la contraseña.",
        })
        return
      }

      setPasswordMsg({
        type: "success",
        text: data.message,
      })
    } catch {
      setPasswordMsg({
        type: "error",
        text: "Ocurrió un error inesperado al preparar el cambio de contraseña.",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleVerificationResend = async () => {
    setVerificationLoading(true)
    setVerificationMsg(null)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        setVerificationMsg({
          type: "error",
          text:
            data.error || "No pudimos reenviar el correo de verificacion.",
        })
        return
      }

      setVerificationMsg({
        type: "success",
        text: data.message,
      })
    } catch {
      setVerificationMsg({
        type: "error",
        text: "Ocurrio un error inesperado al reenviar el correo.",
      })
    } finally {
      setVerificationLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        <h3 className="border-b border-lc-border pb-2 text-xl font-bold font-heading text-lc-white">
          Mis Datos de Envío
        </h3>

        {msg ? (
          <div
            className={`rounded-xl border p-4 text-sm ${
              msg.type === "success"
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : "border-lc-error/20 bg-lc-error/10 text-lc-error"
            }`}
          >
            {msg.text}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            name="name"
            autoComplete="name"
            label="Nombre Completo"
            defaultValue={user.name}
            required
          />
          <Input
            name="phone"
            autoComplete="tel"
            label="Teléfono"
            defaultValue={user.phone || ""}
            placeholder="+57 321..."
          />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            name="address"
            autoComplete="street-address"
            label="Dirección de Envío"
            defaultValue={user.address || ""}
            placeholder="Calle 123 #45-67"
          />
          <Input
            name="city"
            autoComplete="address-level2"
            label="Ciudad / Municipio"
            defaultValue={user.city || ""}
            placeholder="Bogota D.C."
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </form>

      <section className="space-y-6 border-t border-lc-border pt-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-lc-purple" size={20} />
          <div>
            <h3 className="text-xl font-bold font-heading text-lc-white">
              Seguridad de la Cuenta
            </h3>
            <p className="text-sm text-lc-gray">
              {user.hasPassword
                ? "Cambia tu contraseña mediante un enlace temporal enviado a tu correo verificado."
                : "Tu cuenta aún no tiene contraseña. Puedes crear una de forma segura desde tu correo verificado."}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-lc-border bg-lc-darker/60 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-lc-white">
                Estado del correo
              </p>
              <p className="mt-1 text-sm text-lc-gray">
                {user.email}
              </p>
              <p
                className={`mt-2 text-sm ${
                  user.emailVerified ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {user.emailVerified
                  ? "Tu correo ya está verificado."
                  : "Tu correo aún no está verificado."}
              </p>
            </div>

            {!user.emailVerified ? (
              <Button
                type="button"
                variant="secondary"
                className="w-full md:w-auto"
                disabled={verificationLoading}
                onClick={handleVerificationResend}
              >
                {verificationLoading
                  ? "Reenviando..."
                  : "Reenviar verificación"}
              </Button>
            ) : null}
          </div>

          {verificationMsg ? (
            <div
              className={`mt-4 rounded-xl border p-4 text-sm ${
                verificationMsg.type === "success"
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : "border-lc-error/20 bg-lc-error/10 text-lc-error"
              }`}
            >
              {verificationMsg.text}
            </div>
          ) : null}
        </div>

        {user.hasGoogleAccount ? (
          <div className="rounded-xl border border-lc-border bg-lc-darker/60 p-4 text-sm text-lc-gray-light">
            Esta cuenta también está vinculada con Google.
          </div>
        ) : null}

        {passwordMsg ? (
          <div
            className={`rounded-xl border p-4 text-sm ${
              passwordMsg.type === "success"
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : "border-lc-error/20 bg-lc-error/10 text-lc-error"
            }`}
          >
            {passwordMsg.text}
          </div>
        ) : null}

        <div className="rounded-xl border border-lc-border bg-lc-darker/60 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-lc-white">
                Contraseña de acceso
              </p>
              <p className="mt-1 text-sm text-lc-gray">
                {user.emailVerified
                  ? "Por seguridad te enviaremos un enlace temporal a tu correo para abrir el formulario de cambio."
                  : "Antes de cambiar o crear una contraseña, confirma tu correo."}
              </p>
            </div>

            <Button
              type="button"
              variant={passwordFlowOpen ? "ghost" : "secondary"}
              className="w-full md:w-auto"
              onClick={() => setPasswordFlowOpen((current) => !current)}
            >
              {passwordFlowOpen
                ? "Cerrar"
                : user.hasPassword
                  ? "Cambiar contraseña"
                  : "Crear contraseña"}
            </Button>
          </div>

          {passwordFlowOpen ? (
            <div className="mt-5 rounded-2xl border border-lc-border/80 bg-lc-black/30 p-5">
              <p className="text-sm text-lc-gray-light">
                {user.emailVerified
                  ? "Al confirmar, enviaremos un correo a tu cuenta con un token temporal de un solo uso. Ese enlace abrirá el formulario seguro para definir tu nueva contraseña."
                  : "Todavía no puedes cambiar la contraseña desde aquí porque tu correo no está verificado. Usa primero el botón de reenviar verificación."}
              </p>
              <p className="mt-3 text-xs uppercase tracking-widest text-lc-gray">
                Validez del enlace: 60 minutos
              </p>

              {user.emailVerified ? (
                <Button
                  type="button"
                  className="mt-5 w-full md:w-auto"
                  disabled={passwordLoading}
                  onClick={handlePasswordChangeRequest}
                >
                  {passwordLoading
                    ? "Enviando correo..."
                    : user.hasPassword
                      ? "Enviar correo para cambiar contraseña"
                      : "Enviar correo para crear contraseña"}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <div className="border-t border-lc-border pt-8">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 font-semibold text-lc-gray transition-colors hover:text-lc-pink"
        >
          <LogOut size={20} />
          Cerrar Sesion
        </button>
      </div>
    </div>
  )
}
