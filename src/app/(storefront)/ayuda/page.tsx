import Link from "next/link"
import { MessageCircle, PackageCheck, RotateCcw, Ruler } from "lucide-react"
import { buildWhatsAppLink } from "@/lib/utils"

const helpTopics = [
  {
    title: "Envios",
    text: "Despachos nacionales con tiempos estimados de 2 a 5 dias habiles.",
    icon: PackageCheck,
  },
  {
    title: "Cambios",
    text: "Revisa talla, estado de prenda y tiempos antes de solicitar un cambio.",
    icon: RotateCcw,
  },
  {
    title: "Tallas",
    text: "Si dudas entre dos tallas, pide asesoria antes de comprar.",
    icon: Ruler,
  },
]

export default function AyudaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="max-w-2xl">
        <p className="mb-3 text-sm font-semibold text-lc-purple-light">
          Soporte LilCake
        </p>
        <h1 className="text-4xl font-heading font-bold text-lc-white sm:text-5xl">
          Ayuda para comprar con claridad
        </h1>
        <p className="mt-5 text-lg leading-8 text-lc-gray-light">
          Resuelve dudas de envio, talla, cambios o disponibilidad antes de
          finalizar tu pedido.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {helpTopics.map((topic) => {
          const Icon = topic.icon

          return (
            <div
              key={topic.title}
              className="rounded-lg border border-lc-border bg-lc-card p-5"
            >
              <Icon size={22} className="text-lc-white" />
              <h2 className="mt-5 text-lg font-heading font-bold text-lc-white">
                {topic.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-lc-gray-light">{topic.text}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-lg border border-lc-border bg-lc-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-lc-white">
              Necesitas ayuda personalizada?
            </h2>
            <p className="mt-2 text-sm leading-6 text-lc-gray-light">
              Escribenos por WhatsApp y te ayudamos con talla, producto o estado
              de compra.
            </p>
          </div>
          <Link
            href={buildWhatsAppLink("Hola, necesito ayuda con LilCake.")}
            className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm"
          >
            <MessageCircle size={18} />
            Contactar
          </Link>
        </div>
      </div>
    </div>
  )
}
