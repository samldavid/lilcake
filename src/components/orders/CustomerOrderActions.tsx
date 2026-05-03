"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import {
  canCustomerCancelOrder,
  canCustomerResumeOrder,
} from "@/lib/order-status"

type CustomerOrderActionsProps = {
  orderId: string
  paymentMethod: string
  status: string
  paymentStatus: string
}

export function CustomerOrderActions({
  orderId,
  paymentMethod,
  status,
  paymentStatus,
}: CustomerOrderActionsProps) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = React.useState<"resume" | "cancel" | "">("")
  const [error, setError] = React.useState("")

  const canResume = canCustomerResumeOrder({ status, paymentStatus, paymentMethod })
  const canCancel = canCustomerCancelOrder({ status, paymentStatus })

  const handleResume = async () => {
    try {
      setLoadingAction("resume")
      setError("")

      const response = await fetch(`/api/orders/${orderId}/resume`, {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No pudimos continuar el pedido.")
      }

      if (!data.url) {
        throw new Error("No recibimos la URL para continuar el pedido.")
      }

      window.location.assign(data.url)
    } catch (resumeError) {
      setError(
        resumeError instanceof Error
          ? resumeError.message
          : "No pudimos continuar el pedido."
      )
      setLoadingAction("")
    }
  }

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Vas a cancelar este pedido pendiente. Esta accion no se puede deshacer."
    )

    if (!confirmed) {
      return
    }

    try {
      setLoadingAction("cancel")
      setError("")

      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No pudimos cancelar el pedido.")
      }

      router.refresh()
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "No pudimos cancelar el pedido."
      )
      setLoadingAction("")
    }
  }

  if (!canResume && !canCancel && !error) {
    return null
  }

  return (
    <div className="space-y-3">
      {(canResume || canCancel) && (
        <div className="flex flex-wrap gap-3">
          {canResume && (
            <Button
              type="button"
              onClick={handleResume}
              disabled={loadingAction !== ""}
            >
              {loadingAction === "resume"
                ? "Abriendo..."
                : paymentMethod === "STRIPE"
                  ? paymentStatus === "FAILED"
                    ? "Reintentar pago"
                    : "Continuar pago"
                  : paymentMethod === "WOMPI"
                    ? paymentStatus === "FAILED"
                      ? "Reintentar con Wompi"
                      : "Continuar con Wompi"
                  : "Abrir WhatsApp"}
            </Button>
          )}
          {canCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={loadingAction !== ""}
            >
              {loadingAction === "cancel" ? "Cancelando..." : "Cancelar pedido"}
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-lc-error/30 bg-lc-error/10 p-3 text-sm text-lc-error">
          {error}
        </div>
      )}
    </div>
  )
}
