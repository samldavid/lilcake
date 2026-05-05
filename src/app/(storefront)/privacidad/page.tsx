import type { Metadata } from "next"
import { LegalDocumentPage } from "@/components/storefront/LegalDocumentPage"

const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
  process.env.SMTP_FROM?.match(/<([^>]+)>/)?.[1] ||
  process.env.SMTP_USER ||
  "contacto@example.com"

const privacySections = [
  {
    id: "responsable",
    title: "Responsable del tratamiento",
    paragraphs: [
      "LilCake es el responsable del tratamiento de los datos personales recolectados a través de este sitio web. Operamos en Colombia y atendemos solicitudes relacionadas con privacidad, actualización o supresión de datos a través del correo de contacto publicado en esta página.",
      "Esta política se interpreta y aplica conforme a la Ley 1581 de 2012, sus decretos reglamentarios y demás normas colombianas que resulten aplicables al tratamiento de datos personales.",
    ],
  },
  {
    id: "datos",
    title: "Datos personales recolectados",
    paragraphs: [
      "LilCake puede recolectar información entregada directamente por el usuario durante el registro, la compra o el soporte. También puede almacenar datos derivados de la relación comercial, como historial de pedidos y datos de envío.",
    ],
    items: [
      "Nombre completo.",
      "Dirección de envío.",
      "Correo electrónico.",
      "Número de teléfono celular.",
      "Información relacionada con pedidos, productos comprados e historial de compras.",
      "Datos de autenticación y seguridad de cuenta necesarios para operar el acceso del usuario.",
    ],
  },
  {
    id: "finalidad",
    title: "Finalidad del tratamiento de datos",
    paragraphs: [
      "Los datos personales se utilizan únicamente para operar la tienda, gestionar la relación comercial y cumplir obligaciones legales y contractuales derivadas de las compras realizadas en LilCake.",
    ],
    items: [
      "Gestionar y procesar pedidos realizados en la tienda.",
      "Coordinar la entrega de productos.",
      "Contactar al cliente en relación con su compra o con la seguridad de su cuenta.",
      "Brindar soporte y atención al cliente.",
      "Enviar información relevante sobre pedidos, servicios o verificaciones necesarias para la operación.",
      "Cumplir obligaciones legales, contables y contractuales.",
    ],
  },
  {
    id: "pagos",
    title: "Medios de pago",
    paragraphs: [
      "Los pagos se procesan mediante terceros especializados, como Stripe o Wompi, o a través de coordinaciones asistidas por WhatsApp para opciones como contraentrega. LilCake no almacena directamente números completos de tarjetas de crédito o débito ni otra información financiera sensible del usuario.",
    ],
  },
  {
    id: "autorizacion",
    title: "Autorización del titular",
    paragraphs: [
      "Al proporcionar sus datos personales por medio del sitio web, el usuario autoriza de manera previa, expresa e informada a LilCake para tratarlos conforme a esta política y a las finalidades aquí descritas.",
    ],
  },
  {
    id: "derechos",
    title: "Derechos de los titulares",
    paragraphs: [
      "De conformidad con la legislación colombiana, los titulares pueden ejercer sus derechos sobre la información personal tratada por LilCake mediante solicitud enviada al correo de contacto publicado en este documento.",
    ],
    items: [
      "Conocer, actualizar y rectificar sus datos personales.",
      "Solicitar prueba de la autorización otorgada.",
      "Ser informados sobre el uso de sus datos.",
      "Presentar quejas ante la Superintendencia de Industria y Comercio cuando aplique.",
      "Revocar la autorización o solicitar la supresión de sus datos cuando no exista obligación legal o contractual de conservarlos.",
    ],
  },
  {
    id: "seguridad",
    title: "Seguridad de la información",
    paragraphs: [
      "LilCake implementa medidas técnicas, administrativas y organizativas razonables para proteger los datos personales contra acceso no autorizado, pérdida, alteración o uso indebido. Aun así, ningún sistema es absolutamente invulnerable y por ello no puede garantizarse una seguridad total en todos los escenarios.",
    ],
  },
  {
    id: "transferencia",
    title: "Transferencia y transmisión de datos",
    paragraphs: [
      "LilCake podrá compartir datos personales con terceros únicamente cuando sea necesario para procesar pagos, realizar entregas, operar servicios tecnológicos o cumplir una obligación legal. Dichos terceros deberán observar estándares razonables de seguridad y confidencialidad.",
    ],
  },
  {
    id: "conservacion",
    title: "Conservación de la información",
    paragraphs: [
      "Los datos personales serán conservados durante el tiempo necesario para cumplir las finalidades descritas en esta política y durante los plazos exigidos por las obligaciones legales, fiscales, contables o contractuales aplicables.",
    ],
  },
  {
    id: "modificaciones",
    title: "Modificaciones y vigencia",
    paragraphs: [
      "LilCake podrá actualizar esta política en cualquier momento. La versión vigente será la publicada en el sitio web y empezará a regir desde la fecha de su publicación.",
    ],
  },
] satisfies Array<{
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
}>

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Conoce cómo LilCake recolecta, usa, protege y conserva los datos personales de sus usuarios y clientes en Colombia.",
}

export default function PrivacidadPage() {
  return (
    <LegalDocumentPage
      eyebrow="Privacidad y protección de datos"
      title="Política de Privacidad"
      subtitle="Política de tratamiento de datos personales de LilCake. Aquí explicamos qué información recolectamos, para qué la usamos y cómo puedes ejercer tus derechos como titular."
      lastUpdated="20 de abril de 2026"
      contactEmail={supportEmail}
      sections={privacySections}
    />
  )
}
