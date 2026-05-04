"use client"

import * as React from "react"
import { Save, ShieldCheck } from "lucide-react"
import type { BusinessSettingsView } from "@/lib/business-settings"

type BusinessSettingsFormProps = {
  initialSettings: BusinessSettingsView
  mode?: "real" | "demo"
  demoNotice?: string
}

type Message = {
  type: "success" | "error"
  text: string
} | null

const fields: Array<{
  name: keyof BusinessSettingsView
  label: string
  placeholder: string
  type?: string
  textarea?: boolean
  span?: "full"
}> = [
  {
    name: "businessName",
    label: "Nombre del negocio",
    placeholder: "LilCake",
  },
  {
    name: "businessId",
    label: "Identificacion / NIT",
    placeholder: "NIT 000.000.000-0",
  },
  {
    name: "businessEmail",
    label: "Correo comercial",
    placeholder: "contacto@negocio.com",
    type: "email",
  },
  {
    name: "businessPhone",
    label: "Telefono",
    placeholder: "+57 300 000 0000",
  },
  {
    name: "businessAddress",
    label: "Direccion",
    placeholder: "Cra 10 # 45-20",
  },
  {
    name: "businessCity",
    label: "Ciudad",
    placeholder: "Bogota, Colombia",
  },
  {
    name: "logoUrl",
    label: "URL del logo (opcional)",
    placeholder: "https://...",
    type: "url",
    span: "full",
  },
  {
    name: "salesNoteDisclaimer",
    label: "Texto legal de la nota de venta",
    placeholder: "Este documento no reemplaza factura electronica...",
    textarea: true,
    span: "full",
  },
]

export function BusinessSettingsForm({
  initialSettings,
  mode = "real",
  demoNotice = "Esto es una demo. Los cambios no se guardan.",
}: BusinessSettingsFormProps) {
  const [settings, setSettings] = React.useState(initialSettings)
  const [message, setMessage] = React.useState<Message>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  function updateField(name: keyof BusinessSettingsView, value: string) {
    setSettings((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)

    if (mode === "demo") {
      setMessage({
        type: "success",
        text: demoNotice,
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/admin/business-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || "No pudimos guardar la configuracion.")
      }

      setSettings(payload)
      setMessage({
        type: "success",
        text: "Configuracion del negocio guardada correctamente.",
      })
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No pudimos guardar la configuracion.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-lc-border bg-lc-card p-5 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-lc-purple">
              Configuracion comercial
            </p>
            <h1 className="font-heading text-2xl font-bold text-lc-white sm:text-3xl">
              Datos del negocio
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-lc-gray sm:text-base">
              Estos datos se usan para generar las notas de venta PDF y para
              mantener la operacion personalizable sin exponer variables de
              entorno ni tocar Vercel.
            </p>
          </div>

          <div className="rounded-2xl border border-lc-success/20 bg-lc-success/10 p-4 text-sm text-lc-success">
            <div className="mb-2 flex items-center gap-2 font-bold">
              <ShieldCheck size={17} />
              Acceso protegido
            </div>
            <p className="leading-relaxed">
              Solo usuarios admin pueden leer o guardar estos datos en el panel
              real. El demo simula el guardado sin escribir en base de datos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((field) => {
            const value = settings[field.name] || ""
            const inputClass =
              "w-full rounded-xl border border-lc-border bg-lc-darker px-4 py-3 text-lc-white outline-none transition-colors placeholder:text-lc-gray focus:border-lc-purple"

            return (
              <label
                key={field.name}
                className={`block ${field.span === "full" ? "md:col-span-2" : ""}`}
              >
                <span className="mb-2 block text-sm font-semibold text-lc-gray">
                  {field.label}
                </span>
                {field.textarea ? (
                  <textarea
                    value={value}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                    placeholder={field.placeholder}
                    rows={5}
                    maxLength={700}
                    className={`${inputClass} resize-none leading-relaxed`}
                  />
                ) : (
                  <input
                    value={value}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                    placeholder={field.placeholder}
                    type={field.type || "text"}
                    className={inputClass}
                    required={field.name === "businessName"}
                  />
                )}
              </label>
            )
          })}
        </div>

        {message ? (
          <div
            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-lc-success/30 bg-lc-success/10 text-lc-success"
                : "border-lc-error/30 bg-lc-error/10 text-lc-error"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-lc-gray">
            La nota de venta sigue siendo un comprobante interno; si el negocio
            debe facturar electronicamente, debe hacerlo por el medio autorizado.
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-lc-gradient px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />
            {mode === "demo"
              ? "Simular guardado"
              : isSaving
                ? "Guardando..."
                : "Guardar cambios"}
          </button>
        </div>
      </div>
    </form>
  )
}
