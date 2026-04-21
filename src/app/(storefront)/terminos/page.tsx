import type { Metadata } from "next"
import { LegalDocumentPage } from "@/components/storefront/LegalDocumentPage"

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
  process.env.SMTP_FROM?.match(/<([^>]+)>/)?.[1] ||
  process.env.SMTP_USER ||
  "247061022+samldavid@users.noreply.github.com"

const termsSections = [
  {
    id: "objeto",
    title: "Objeto",
    paragraphs: [
      "LilCake es una tienda online dedicada a la comercialización de prendas de vestir y accesorios dentro del territorio colombiano. El acceso y uso de este sitio implica la aceptación plena de los presentes términos y condiciones.",
    ],
  },
  {
    id: "uso-del-sitio",
    title: "Uso del sitio",
    paragraphs: [
      "El usuario se compromete a utilizar este sitio de manera lícita, responsable y conforme a la normativa aplicable. LilCake podrá restringir el acceso cuando detecte actividades fraudulentas o abusivas.",
    ],
    items: [
      "Proporcionar información veraz, completa y actualizada.",
      "No realizar actividades fraudulentas o que afecten el funcionamiento del sitio.",
      "No utilizar la plataforma para vulnerar derechos de terceros o normas vigentes.",
    ],
  },
  {
    id: "registro",
    title: "Registro y cuenta",
    paragraphs: [
      "Para realizar compras, el usuario puede crear una cuenta o proporcionar los datos necesarios durante el checkout. Cada usuario es responsable de la confidencialidad de sus credenciales y de las actividades realizadas desde su cuenta.",
    ],
  },
  {
    id: "productos",
    title: "Productos",
    paragraphs: [
      "Todos los productos publicados están sujetos a disponibilidad. LilCake se reserva el derecho de modificar, actualizar o retirar referencias sin previo aviso.",
    ],
    items: [
      "Las imágenes tienen carácter ilustrativo y pueden variar ligeramente del producto real.",
      "La disponibilidad de tallas, colores o referencias puede cambiar sin previo aviso.",
    ],
  },
  {
    id: "precios",
    title: "Precios",
    paragraphs: [
      "Los precios se muestran en la moneda aplicable y pueden cambiar sin previo aviso. El valor final de la compra se confirmará durante el proceso de checkout, antes de que el usuario complete el pago.",
    ],
  },
  {
    id: "compra",
    title: "Proceso de compra",
    paragraphs: [
      "El proceso de compra en LilCake consiste en seleccionar productos, proporcionar datos de envío, elegir un método de pago y confirmar la compra. La orden se considerará registrada una vez el sistema confirme el pago o el pedido según el método elegido.",
    ],
  },
  {
    id: "pagos",
    title: "Pagos",
    paragraphs: [
      "Los pagos se realizan a través de pasarelas externas o mediante transferencias coordinadas por canales como WhatsApp. LilCake no almacena información financiera sensible del usuario.",
    ],
  },
  {
    id: "envios",
    title: "Envíos",
    paragraphs: [
      "Los envíos se realizan dentro del territorio colombiano. Los tiempos de entrega son estimados y pueden variar por razones logísticas, disponibilidad o situaciones atribuibles a terceros.",
    ],
  },
  {
    id: "retracto",
    title: "Derecho de retracto, cambios y devoluciones",
    paragraphs: [
      "El cliente podrá ejercer el derecho de retracto en los términos previstos por la Ley 1480 de 2011 y demás normas aplicables al comercio electrónico, siempre que el producto no haya sido usado y se encuentre en condiciones originales.",
      "Las políticas específicas de cambios, devoluciones y garantías podrán ser definidas por LilCake y comunicadas al cliente a través del sitio o de los canales de atención.",
    ],
  },
  {
    id: "responsabilidad",
    title: "Responsabilidad",
    paragraphs: [
      "LilCake no será responsable por fallos en plataformas de pago externas, problemas derivados del uso indebido del sitio o retrasos atribuibles a terceros ajenos a su control.",
    ],
  },
  {
    id: "propiedad-intelectual",
    title: "Propiedad intelectual",
    paragraphs: [
      "Todo el contenido del sitio, incluyendo textos, diseño, fotografías, marcas, gráficos y demás elementos distintivos, es propiedad de LilCake o de sus respectivos titulares y está protegido por la legislación aplicable.",
    ],
  },
  {
    id: "modificaciones",
    title: "Modificaciones y ley aplicable",
    paragraphs: [
      "LilCake podrá modificar estos términos en cualquier momento. La versión vigente será la publicada en el sitio web. Estos términos se rigen por las leyes de la República de Colombia.",
    ],
  },
] satisfies Array<{
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
}>

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Consulta los términos y condiciones de uso, compra, pagos, envíos y responsabilidades aplicables a las compras en LilCake.",
}

export default function TerminosPage() {
  return (
    <LegalDocumentPage
      eyebrow="Condiciones de uso y compra"
      title="Términos y Condiciones"
      subtitle="Estos términos regulan el acceso al sitio web de LilCake, el uso de la cuenta del usuario y las condiciones generales aplicables a las compras realizadas dentro de Colombia."
      lastUpdated="20 de abril de 2026"
      contactEmail={supportEmail}
      sections={termsSections}
    />
  )
}
