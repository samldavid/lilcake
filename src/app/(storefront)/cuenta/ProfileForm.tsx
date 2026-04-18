"use client"

import * as React from "react"
import { updateUserProfile } from "@/app/actions/user"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

interface UserData {
  name: string
  phone: string | null
  address: string | null
  city: string | null
}

export function ProfileForm({ user }: { user: UserData }) {
  const [loading, setLoading] = React.useState(false)
  const [msg, setMsg] = React.useState<{type: "error" | "success", text: string} | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-xl font-bold font-heading text-lc-white border-b border-lc-border pb-2">Mis Datos de Envío</h3>
        
        {msg && (
          <div className={`p-4 rounded-xl text-sm ${msg.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-lc-error/10 text-lc-error border border-lc-error/20"}`}>
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            name="name"
            label="Nombre Completo"
            defaultValue={user.name}
            required
          />
          <Input 
            name="phone"
            label="Teléfono"
            defaultValue={user.phone || ""}
            placeholder="+57 321..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            name="address"
            label="Dirección de Envío"
            defaultValue={user.address || ""}
            placeholder="Calle 123 #45-67"
          />
          <Input 
            name="city"
            label="Ciudad / Municipio"
            defaultValue={user.city || ""}
            placeholder="Bogotá D.C."
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </form>

      <div className="border-t border-lc-border pt-8">
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 text-lc-gray hover:text-lc-pink transition-colors font-semibold"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
