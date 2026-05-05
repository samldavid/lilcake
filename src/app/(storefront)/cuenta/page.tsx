import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Package, SearchX } from "lucide-react"
import { Prisma } from "@prisma/client"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./ProfileForm"
import { formatCOP } from "@/lib/utils"
import { Badge } from "@/components/ui/Badge"
import {
  getOrderStatusBadgeVariant,
  getOrderStatusLabel,
  getPaymentStatusBadgeLabel,
  getPaymentStatusClasses,
} from "@/lib/order-status"

const accountPageUserSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  password: true,
  phone: true,
  address: true,
  city: true,
  accounts: {
    select: {
      provider: true,
    },
  },
  orders: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      createdAt: true,
      status: true,
      paymentStatus: true,
      total: true,
      shippingCarrier: true,
      trackingNumber: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
  },
} as const satisfies Prisma.UserSelect

type AccountPageUser = Prisma.UserGetPayload<{
  select: typeof accountPageUserSelect
}>

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/cuenta")
  }

  const dbUser: AccountPageUser | null = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: accountPageUserSelect,
  })

  if (!dbUser) {
    redirect("/login")
  }

  const { orders } = dbUser
  const hasPassword = Boolean(dbUser.password)
  const hasGoogleAccount = dbUser.accounts.some(
    (account) => account.provider === "google"
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col md:flex-row gap-12 animate-fade-in">
      <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
        <div className="bg-lc-dark border border-lc-border rounded-2xl p-6 shadow-xl sticky top-28">
          <div className="w-20 h-20 bg-gradient-to-tr from-lc-purple to-lc-pink rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-[0_0_20px_rgba(111,0,255,0.3)]">
            {dbUser.image ? (
              <img src={dbUser.image} alt="Avatar" className="w-full h-full rounded-full object-cover p-1 bg-lc-black" />
            ) : (
              <span className="text-white">{dbUser.name?.charAt(0).toUpperCase() || "L"}</span>
            )}
          </div>
          <h2 className="text-2xl font-bold font-heading text-lc-white mb-1">
            Hola, {dbUser.name?.split(" ")[0] || "Cliente"}
          </h2>
          <p className="text-sm text-lc-gray mb-6">{dbUser.email}</p>

          <p className="text-xs text-lc-gray-light uppercase tracking-widest font-bold mb-2">
            Resumen
          </p>
          <div className="flex items-center justify-between bg-lc-black rounded-lg p-3 border border-lc-border border-opacity-50 mb-4">
            <span className="text-sm text-lc-gray">Total Pedidos</span>
            <span className="font-bold text-lc-white">{orders.length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-12">
        <section className="bg-lc-dark border border-lc-border rounded-2xl p-6 md:p-10 shadow-xl">
          <ProfileForm
            user={{
              name: dbUser.name || "",
              email: dbUser.email || "",
              emailVerified: Boolean(dbUser.emailVerified),
              phone: dbUser.phone,
              address: dbUser.address,
              city: dbUser.city,
              hasPassword,
              hasGoogleAccount,
            }}
          />
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-lc-purple" />
            <h3 className="text-2xl font-bold font-heading text-lc-white">
              Mi Historial de Compras
            </h3>
          </div>

          {orders.length === 0 ? (
            <div className="bg-lc-dark border border-lc-border border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
              <SearchX size={48} className="text-lc-gray mb-4 opacity-50" />
              <p className="text-lc-gray-light text-lg">
                Aún no tienes ningún pedido a tu nombre.
              </p>
              <p className="text-sm text-lc-gray mt-2">
                Explora la nueva colección y estrena algo épico.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border border-lc-border bg-lc-dark p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-lc-purple/50 hover:shadow-[0_18px_45px_rgba(0,0,0,0.24)] sm:p-6"
                >
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(170px,auto)_minmax(240px,auto)] lg:items-center">
                    <div className="min-w-0">
                      <span className="mb-2 block font-mono text-xs font-bold tracking-widest text-lc-purple">
                        {order.orderNumber}
                      </span>
                      <p className="mb-1 text-lg font-semibold text-lc-white">
                        {order.createdAt.toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-lc-gray">
                        {order._count.items} {order._count.items === 1 ? "artículo" : "artículos"}
                      </p>
                      {order.trackingNumber ? (
                        <p className="mt-3 max-w-full break-words text-sm font-medium text-lc-cyan">
                          {order.shippingCarrier
                            ? `${order.shippingCarrier} • Guía ${order.trackingNumber}`
                            : `Guía ${order.trackingNumber}`}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-center">
                      <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                      <span
                        className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${getPaymentStatusClasses(order.paymentStatus)}`}
                      >
                        {getPaymentStatusBadgeLabel(order.paymentStatus)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:justify-end lg:gap-6">
                      <div className="text-left sm:text-right">
                        <p className="mb-1 text-xs text-lc-gray">Total</p>
                        <p className="text-xl font-bold text-lc-white">
                          {formatCOP(order.total)}
                        </p>
                      </div>
                      <Link
                        href={`/cuenta/pedidos/${order.id}`}
                        className="inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold transition-all btn-primary sm:w-auto"
                      >
                        Ver pedido
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
