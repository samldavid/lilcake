import Link from "next/link"

export default function AyudaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-fade-in text-center">
      <h1 className="text-4xl font-heading font-bold text-lc-white mb-6">Centro de Ayuda</h1>
      <p className="text-lc-gray text-lg mb-12">
        Estamos construyendo nuestro portal de servicio al cliente. 
        Pronto encontrarás aquí toda la información sobre envíos, tallas y devoluciones.
      </p>
      
      <div className="bg-lc-darker border border-lc-border p-8 rounded-2xl inline-block text-left w-full max-w-lg shadow-xl shadow-lc-purple/5">
        <h3 className="text-xl font-bold text-lc-white mb-4">¿Tienes una duda urgente?</h3>
        <p className="text-lc-gray text-sm mb-6">
          Escríbenos directamente a nuestro WhatsApp o envíanos un correo. Nuestro equipo de soporte está disponible.
        </p>
        <Link 
          href="https://wa.me/573000000000" 
          className="inline-flex w-full items-center justify-center rounded-xl font-semibold transition-all h-11 px-8 text-sm bg-lc-purple hover:bg-lc-pink text-white"
        >
          Contactar por WhatsApp
        </Link>
      </div>
    </div>
  )
}
