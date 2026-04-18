"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/lib/order-status"

type AdminOrderStatusFormProps = {
  orderId: string
  status: string
  paymentStatus: string
  trackingNumber: string | null
  notes: string | null
}

export function AdminOrderStatusForm({
  orderId,
  status,
  paymentStatus,
  trackingNumber,
  notes,
}: AdminOrderStatusFormProps) {
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    status,
    paymentStatus,
    trackingNumber: trackingNumber || "",
    notes: notes || "",
  })
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")
      setMessage("")

      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No pudimos actualizar el pedido.")
      }

      setFormData({
        status: data.status,
        paymentStatus: data.paymentStatus,
        trackingNumber: data.trackingNumber || "",
        notes: data.notes || "",
      })
      setMessage("Cambios guardados correctamente.")
      router.refresh()
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "No pudimos actualizar el pedido."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-lc-gray-light mb-1.5 ml-1">
            Estado del pedido
          </label>
          <select
            className="w-full bg-lc-darker border border-lc-border rounded-xl px-4 py-3 text-sm text-lc-white focus:border-lc-purple outline-none"
            value={formData.status}
            onChange={(e) =>
              setFormData((current) => ({ ...current, status: e.target.value }))
            }
          >
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-lc-gray-light mb-1.5 ml-1">
            Estado del pago
          </label>
          <select
            className="w-full bg-lc-darker border border-lc-border rounded-xl px-4 py-3 text-sm text-lc-white focus:border-lc-purple outline-none"
            value={formData.paymentStatus}
            onChange={(e) =>
              setFormData((current) => ({
                ...current,
                paymentStatus: e.target.value,
              }))
            }
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-lc-gray-light mb-1.5 ml-1">
          Numero de guia
        </label>
        <input
          type="text"
          className="input-field"
          placeholder="Opcional"
          value={formData.trackingNumber}
          onChange={(e) =>
            setFormData((current) => ({
              ...current,
              trackingNumber: e.target.value,
            }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-lc-gray-light mb-1.5 ml-1">
          Notas internas
        </label>
        <textarea
          rows={4}
          className="input-field resize-none"
          placeholder="Observaciones del pedido..."
          value={formData.notes}
          onChange={(e) =>
            setFormData((current) => ({ ...current, notes: e.target.value }))
          }
        />
      </div>

      {message && (
        <div className="rounded-xl border border-lc-success/30 bg-lc-success/10 p-3 text-sm text-lc-success">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-lc-error/30 bg-lc-error/10 p-3 text-sm text-lc-error">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  )
}
