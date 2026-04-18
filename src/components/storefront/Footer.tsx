import Link from "next/link"

// SVG Icons for Socials to avoid lucide versioning issues
const InstagramIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const TwitterIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const FacebookIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;

export function Footer() {
  return (
    <footer className="bg-lc-darker border-t border-lc-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-lc-purple p-1 rounded-lg overflow-hidden flex items-center justify-center w-8 h-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/iconolilcake.png" alt="LilCake Logo" className="w-full h-full object-cover rounded-sm" />
              </div>
              <span className="text-xl font-bold font-heading tracking-tighter text-lc-white">
                LilCake
              </span>
            </Link>
            <p className="text-lc-gray text-sm mb-6">
              Tu estilo, tu regla. Ropa urbana, sneakers y accesorios para la nueva generación en Colombia.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-lc-gray hover:text-lc-purple transition-colors">
                <InstagramIcon />
              </a>
              <a href="#" className="text-lc-gray hover:text-lc-cyan transition-colors">
                <TwitterIcon />
              </a>
              <a href="#" className="text-lc-gray hover:text-[#1877F2] transition-colors">
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-heading font-bold text-lc-white mb-4">Tienda</h4>
            <ul className="space-y-3 shrink-0">
              <li><Link href="/productos?categoria=ropa" className="text-sm text-lc-gray hover:text-lc-purple transition-colors">Ropa</Link></li>
              <li><Link href="/productos?categoria=zapatos" className="text-sm text-lc-gray hover:text-lc-purple transition-colors">Zapatos</Link></li>
              <li><Link href="/productos?categoria=accesorios" className="text-sm text-lc-gray hover:text-lc-purple transition-colors">Accesorios</Link></li>
              <li><Link href="/productos" className="text-sm text-lc-gray hover:text-lc-purple transition-colors">Todo el catálogo</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-heading font-bold text-lc-white mb-4">Ayuda</h4>
            <ul className="space-y-3 shrink-0">
              <li><Link href="/ayuda" className="text-sm text-lc-gray hover:text-lc-white transition-colors">Envíos y Entregas</Link></li>
              <li><Link href="/ayuda" className="text-sm text-lc-gray hover:text-lc-white transition-colors">Cambios y Devoluciones</Link></li>
              <li><Link href="/ayuda" className="text-lc-gray hover:text-lc-white transition-colors">Guía de Tallas</Link></li>
              <li><Link href="/ayuda" className="text-sm text-lc-gray hover:text-lc-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-bold text-lc-white mb-4">Únete al Drop</h4>
            <p className="text-sm text-lc-gray mb-4">
              Recibe acceso anticipado a nuevas colecciones y descuentos exclusivos.
            </p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="tu@email.com" 
                className="bg-lc-dark border border-lc-border rounded-lg px-4 py-2 text-sm text-white w-full focus:outline-none focus:border-lc-purple"
              />
              <button className="bg-lc-purple hover:bg-lc-purple-light text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                →
              </button>
            </form>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-lc-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-lc-gray">
            © {new Date().getFullYear()} LilCake. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-lc-gray">
            <Link href="/privacidad" className="hover:text-lc-white">Privacidad</Link>
            <Link href="/terminos" className="hover:text-lc-white">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
