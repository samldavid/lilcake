export const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
] as const

export const PAYMENT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagado" },
  { value: "FAILED", label: "Fallido" },
] as const

export function getOrderStatusLabel(status: string) {
  return ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

export function getPaymentStatusLabel(status: string) {
  return (
    PAYMENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
  )
}

export function getOrderStatusBadgeVariant(
  status: string
): "purple" | "pink" | "success" | "warning" | "error" {
  switch (status) {
    case "PENDING":
      return "warning"
    case "CONFIRMED":
      return "purple"
    case "SHIPPED":
      return "pink"
    case "DELIVERED":
      return "success"
    case "CANCELLED":
      return "error"
    default:
      return "purple"
  }
}

export function getPaymentStatusClasses(status: string) {
  switch (status) {
    case "PAID":
      return "bg-lc-success/10 text-lc-success border border-lc-success/20"
    case "FAILED":
      return "bg-lc-error/10 text-lc-error border border-lc-error/20"
    default:
      return "bg-lc-warning/10 text-lc-warning border border-lc-warning/20"
  }
}

export function getPaymentMethodLabel(paymentMethod: string) {
  switch (paymentMethod) {
    case "STRIPE":
      return "Tarjeta con Stripe"
    case "WOMPI":
      return "Wompi"
    case "WHATSAPP":
      return "WhatsApp / transferencia"
    default:
      return paymentMethod
  }
}

export function canCustomerResumeOrder(order: {
  status: string
  paymentStatus: string
  paymentMethod: string
}) {
  return (
    order.status === "PENDING" &&
    order.paymentStatus !== "PAID" &&
    (order.paymentMethod === "STRIPE" ||
      order.paymentMethod === "WOMPI" ||
      order.paymentMethod === "WHATSAPP")
  )
}

export function canCustomerCancelOrder(order: {
  status: string
  paymentStatus: string
}) {
  return order.status === "PENDING" && order.paymentStatus !== "PAID"
}
