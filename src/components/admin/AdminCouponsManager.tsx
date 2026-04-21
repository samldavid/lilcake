"use client"

import * as React from "react"
import { useDeferredValue } from "react"
import { Edit, Loader2, Plus, Power, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { AdminSearchInput } from "@/components/admin/AdminSearchInput"
import { scoreAdminSearchMatch } from "@/lib/admin-search"
import type { AdminCouponRow } from "@/lib/admin-coupons"
import { formatCOP } from "@/lib/utils"

type CouponFormState = {
  code: string
  type: "PERCENTAGE" | "FIXED"
  value: string
  minPurchase: string
  maxUses: string
  maxUsesPerUser: string
  expiresAt: string
  isActive: boolean
}

const emptyFormState: CouponFormState = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minPurchase: "",
  maxUses: "1",
  maxUsesPerUser: "1",
  expiresAt: "",
  isActive: true,
}

function formatCouponValue(coupon: Pick<AdminCouponRow, "type" | "value">) {
  return coupon.type === "PERCENTAGE"
    ? `${coupon.value}% OFF`
    : `${formatCOP(coupon.value)} OFF`
}

function toDateTimeLocalValue(isoDate: string | null) {
  if (!isoDate) {
    return ""
  }

  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const offsetMinutes = date.getTimezoneOffset()
  const adjustedDate = new Date(date.getTime() - offsetMinutes * 60_000)

  return adjustedDate.toISOString().slice(0, 16)
}

function payloadFromRow(coupon: AdminCouponRow) {
  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    minPurchase: coupon.minPurchase,
    maxUses: coupon.maxUses,
    maxUsesPerUser: coupon.maxUsesPerUser,
    expiresAt: coupon.expiresAt,
    isActive: coupon.isActive,
  }
}

export function AdminCouponsManager({
  initialCoupons,
}: {
  initialCoupons: AdminCouponRow[]
}) {
  const [coupons, setCoupons] = React.useState(initialCoupons)
  const [query, setQuery] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [formState, setFormState] = React.useState<CouponFormState>(emptyFormState)
  const [isSaving, setIsSaving] = React.useState(false)
  const [busyCouponId, setBusyCouponId] = React.useState<string | null>(null)
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const deferredQuery = useDeferredValue(query)
  const activeQuery = deferredQuery.trim()

  React.useEffect(() => {
    if (!isFormOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isFormOpen])

  const filteredCoupons = activeQuery
    ? coupons
        .map((coupon) => ({
          coupon,
          score: scoreAdminSearchMatch(activeQuery, [
            coupon.code,
            coupon.type === "PERCENTAGE" ? "porcentaje porcentaje off" : "fijo valor cop",
            coupon.isActive ? "activo" : "inactivo",
            coupon.maxUses ? `${coupon.usedCount} ${coupon.maxUses}` : `${coupon.usedCount}`,
            coupon.maxUsesPerUser
              ? `${coupon.maxUsesPerUser} por cliente`
              : "sin limite por cliente",
            `${coupon.totalOrders} pedidos`,
            `${coupon.paidOrders} pagados`,
          ]),
        }))
        .filter((entry) => entry.score > 0)
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score
          }

          return right.coupon.createdAt.localeCompare(left.coupon.createdAt)
        })
        .map((entry) => entry.coupon)
    : coupons

  const stats = React.useMemo(() => {
    return {
      activeCoupons: coupons.filter((coupon) => coupon.isActive).length,
      reservedUses: coupons.reduce((acc, coupon) => acc + coupon.usedCount, 0),
      paidOrders: coupons.reduce((acc, coupon) => acc + coupon.paidOrders, 0),
      paidRevenue: coupons.reduce((acc, coupon) => acc + coupon.paidRevenue, 0),
    }
  }, [coupons])

  function closeForm() {
    setEditingId(null)
    setFormState(emptyFormState)
    setIsFormOpen(false)
  }

  function openCreateForm() {
    setEditingId(null)
    setFormState(emptyFormState)
    setFeedback(null)
    setIsFormOpen(true)
  }

  function openEditForm(coupon: AdminCouponRow) {
    setEditingId(coupon.id)
    setFormState({
      code: coupon.code,
      type: coupon.type,
      value: `${coupon.value}`,
      minPurchase: coupon.minPurchase ? `${coupon.minPurchase}` : "",
      maxUses: coupon.maxUses ? `${coupon.maxUses}` : "",
      maxUsesPerUser: coupon.maxUsesPerUser ? `${coupon.maxUsesPerUser}` : "",
      expiresAt: toDateTimeLocalValue(coupon.expiresAt),
      isActive: coupon.isActive,
    })
    setFeedback(null)
    setIsFormOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setFeedback(null)

    const payload = {
      code: formState.code.trim(),
      type: formState.type,
      value: Number(formState.value),
      minPurchase: formState.minPurchase ? Number(formState.minPurchase) : null,
      maxUses: formState.maxUses ? Number(formState.maxUses) : null,
      maxUsesPerUser: formState.maxUsesPerUser
        ? Number(formState.maxUsesPerUser)
        : null,
      expiresAt: formState.expiresAt
        ? new Date(formState.expiresAt).toISOString()
        : null,
      isActive: formState.isActive,
    }

    try {
      const isEditing = Boolean(editingId)
      const endpoint = isEditing
        ? `/api/admin/coupons/${editingId}`
        : "/api/admin/coupons"
      const method = isEditing ? "PUT" : "POST"
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No pudimos guardar el cupon.")
      }

      const savedCoupon = data as AdminCouponRow

      setCoupons((currentCoupons) => {
        const withoutCurrent = currentCoupons.filter(
          (coupon) => coupon.id !== savedCoupon.id
        )

        return [savedCoupon, ...withoutCurrent].sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt)
        )
      })
      setFeedback({
        type: "success",
        message: isEditing
          ? "El cupon se actualizo correctamente."
          : "El cupon se creo correctamente.",
      })
      closeForm()
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "No pudimos guardar el cupon.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(couponId: string) {
    const confirmed = window.confirm(
      "Esta accion eliminara el cupon si no tiene pedidos asociados. Deseas continuar?"
    )

    if (!confirmed) {
      return
    }

    setBusyCouponId(couponId)
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No pudimos eliminar el cupon.")
      }

      setCoupons((currentCoupons) =>
        currentCoupons.filter((coupon) => coupon.id !== couponId)
      )
      if (editingId === couponId) {
        closeForm()
      }
      setFeedback({
        type: "success",
        message: "El cupon se elimino correctamente.",
      })
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "No pudimos eliminar el cupon.",
      })
    } finally {
      setBusyCouponId(null)
    }
  }

  async function handleToggleActive(coupon: AdminCouponRow) {
    setBusyCouponId(coupon.id)
    setFeedback(null)

    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payloadFromRow(coupon),
          expiresAt: coupon.expiresAt,
          isActive: !coupon.isActive,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No pudimos actualizar el cupon.")
      }

      setCoupons((currentCoupons) =>
        currentCoupons.map((currentCoupon) =>
          currentCoupon.id === coupon.id ? (data as AdminCouponRow) : currentCoupon
        )
      )
      setFeedback({
        type: "success",
        message: coupon.isActive
          ? "El cupon se desactivo correctamente."
          : "El cupon se activo correctamente.",
      })
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "No pudimos actualizar el cupon.",
      })
    } finally {
      setBusyCouponId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-lc-border bg-lc-card p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-lc-gray">
            Activos
          </p>
          <p className="mt-3 text-3xl font-heading font-bold text-lc-white">
            {stats.activeCoupons}
          </p>
        </div>
        <div className="rounded-2xl border border-lc-border bg-lc-card p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-lc-gray">
            Usos reservados
          </p>
          <p className="mt-3 text-3xl font-heading font-bold text-lc-white">
            {stats.reservedUses}
          </p>
        </div>
        <div className="rounded-2xl border border-lc-border bg-lc-card p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-lc-gray">
            Pedidos pagados
          </p>
          <p className="mt-3 text-3xl font-heading font-bold text-lc-white">
            {stats.paidOrders}
          </p>
        </div>
        <div className="rounded-2xl border border-lc-border bg-lc-card p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-lc-gray">
            Ingreso asociado
          </p>
          <p className="mt-3 text-3xl font-heading font-bold text-lc-white">
            {formatCOP(stats.paidRevenue)}
          </p>
        </div>
      </div>

      {feedback ? (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            feedback.type === "success"
              ? "border-lc-success/30 bg-lc-success/10 text-lc-success"
              : "border-lc-error/30 bg-lc-error/10 text-lc-error"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-lc-border bg-lc-card p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <AdminSearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar por codigo, tipo, estado o uso..."
            />
            <p className="mt-3 text-xs text-lc-gray">
              {query.trim()
                ? `${filteredCoupons.length} coincidencias en tiempo real`
                : `${coupons.length} cupones cargados`}
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={openCreateForm}>
            <Plus size={18} />
            Crear cupon
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-lc-border bg-lc-card">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="border-b border-lc-border bg-lc-darker">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    Codigo
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    Descuento
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    Uso global
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    Pedidos
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-lc-gray">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lc-border">
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-lc-gray">
                      {query.trim()
                        ? `No encontramos cupones que coincidan con "${query.trim()}".`
                        : "Todavia no hay cupones registrados."}
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => {
                    const isBusy = busyCouponId === coupon.id
                    const isExpired =
                      Boolean(coupon.expiresAt) &&
                      new Date(coupon.expiresAt as string) <= new Date()

                    return (
                      <tr key={coupon.id} className="transition-colors hover:bg-lc-dark/40">
                        <td className="px-6 py-4">
                          <div className="inline-flex rounded-xl border border-lc-border bg-lc-darker px-3 py-1 font-mono text-sm font-bold text-lc-white">
                            {coupon.code}
                          </div>
                          <p className="mt-2 text-xs text-lc-gray">
                            Creado el {new Date(coupon.createdAt).toLocaleDateString("es-CO")}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-lc-pink">
                            {formatCouponValue(coupon)}
                          </p>
                          <p className="mt-1 text-xs text-lc-gray">
                            {coupon.minPurchase
                              ? `Minimo ${formatCOP(coupon.minPurchase)}`
                              : "Sin compra minima"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-lc-white">
                            {coupon.usedCount}
                            <span className="font-normal text-lc-gray">
                              {" "}
                              / {coupon.maxUses ?? "sin limite"}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-lc-gray">
                            {coupon.paidOrders} pagos confirmados
                          </p>
                          {coupon.maxUses ? (
                            <p className="mt-1 text-xs text-lc-gray">
                              Restantes: {Math.max(coupon.maxUses - coupon.usedCount, 0)}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs text-lc-gray">
                            Por cliente: {coupon.maxUsesPerUser ?? "sin limite"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-lc-white">
                            {coupon.totalOrders} pedidos
                          </p>
                          <p className="mt-1 text-xs text-lc-gray">
                            {coupon.pendingOrders} pendientes / {coupon.cancelledOrders} cancelados
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {coupon.isActive ? (
                            <Badge
                              variant={
                                isExpired
                                  ? "warning"
                                  : coupon.maxUses !== null &&
                                      coupon.usedCount >= coupon.maxUses
                                    ? "error"
                                    : "success"
                              }
                            >
                              {isExpired
                                ? "Vencido"
                                : coupon.maxUses !== null &&
                                    coupon.usedCount >= coupon.maxUses
                                  ? "Agotado"
                                  : "Activo"}
                            </Badge>
                          ) : (
                            <Badge variant="error" className="bg-lc-dark text-lc-gray">
                              Inactivo
                            </Badge>
                          )}
                          <p className="mt-2 text-xs text-lc-gray">
                            {coupon.expiresAt
                              ? `Expira ${new Date(coupon.expiresAt).toLocaleString("es-CO")}`
                              : "Sin fecha de expiracion"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(coupon)}
                              className="rounded-lg p-2 text-lc-gray transition-colors hover:bg-lc-cyan/10 hover:text-lc-cyan"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleToggleActive(coupon)}
                              className="rounded-lg p-2 text-lc-gray transition-colors hover:bg-lc-purple/10 hover:text-lc-purple"
                              title={coupon.isActive ? "Desactivar" : "Activar"}
                              disabled={isBusy}
                            >
                              {isBusy ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Power size={18} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(coupon.id)}
                              className="rounded-lg p-2 text-lc-gray transition-colors hover:bg-lc-error/10 hover:text-lc-error"
                              title="Eliminar"
                              disabled={isBusy}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-4xl rounded-[28px] border border-lc-border bg-lc-card shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-lc-border px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-lc-gray">
                  Configuracion
                </p>
                <h2 className="mt-2 text-2xl font-heading font-bold text-lc-white">
                  {editingId ? "Editar cupon" : "Crear cupon"}
                </h2>
                <p className="mt-2 text-sm text-lc-gray">
                  Define el codigo, el descuento y los limites de uso sin apretar el formulario.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-2xl border border-lc-border p-3 text-lc-gray transition-colors hover:text-lc-white"
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-6 px-6 py-6 sm:px-8 sm:py-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5">
                <Input
                  label="Codigo"
                  value={formState.code}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="BIENVENIDA10"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 ml-1 block text-sm font-medium text-lc-gray-light">
                    Tipo
                  </label>
                  <select
                    value={formState.type}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        type: event.target.value as "PERCENTAGE" | "FIXED",
                      }))
                    }
                    className="input-field"
                  >
                    <option value="PERCENTAGE">Porcentaje</option>
                    <option value="FIXED">Valor fijo</option>
                  </select>
                </div>
                <Input
                  label={formState.type === "PERCENTAGE" ? "Descuento (%)" : "Descuento (COP)"}
                  type="number"
                  min={0}
                  step={formState.type === "PERCENTAGE" ? "1" : "100"}
                  value={formState.value}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      value: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <Input
                  label="Compra minima (opcional)"
                  type="number"
                  min={0}
                  step="100"
                  value={formState.minPurchase}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      minPurchase: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Limite total de usos"
                  type="number"
                  min={1}
                  step="1"
                  value={formState.maxUses}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      maxUses: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Limite por cliente"
                  type="number"
                  min={1}
                  step="1"
                  value={formState.maxUsesPerUser}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      maxUsesPerUser: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="rounded-2xl border border-lc-border bg-lc-darker/60 p-4 text-sm text-lc-gray">
                Puedes dejar cualquiera de los dos limites vacio para permitir usos
                ilimitados en esa dimension. Por defecto, los cupones nuevos salen
                con 1 uso global y 1 uso por cliente.
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.3fr_0.9fr] md:items-end">
                <Input
                  label="Expira el (opcional)"
                  type="datetime-local"
                  value={formState.expiresAt}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      expiresAt: event.target.value,
                    }))
                  }
                />
                <label className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-lc-border bg-lc-darker/60 px-4 py-3 text-sm text-lc-white">
                  <input
                    type="checkbox"
                    checked={formState.isActive}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-lc-border bg-lc-black text-lc-purple focus:ring-lc-purple"
                  />
                  El cupon estara disponible inmediatamente
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-lc-border pt-6 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={closeForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="sm:min-w-[180px]">
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : editingId ? (
                    "Guardar cambios"
                  ) : (
                    "Crear cupon"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
