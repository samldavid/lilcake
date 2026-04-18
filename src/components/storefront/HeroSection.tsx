import Link from "next/link"
import { ArrowRight, Flame, Layers, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-lc-black pt-16 pb-24 lg:pt-24 lg:pb-32">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lc-purple/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-lc-pink/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lc-dark border border-lc-border mb-8">
              <Sparkles size={16} className="text-lc-warning" />
              <span className="text-sm font-semibold tracking-wide text-lc-gray-light uppercase">Nueva Colección Drop #04</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tighter text-lc-white leading-[1.1] mb-6">
              TU ESTILO. <br />
              <span className="gradient-text">TU REGLA.</span>
            </h1>
            
            <p className="text-lg text-lc-gray-light mb-10 max-w-xl leading-relaxed">
              Descubre la nueva ola del streetwear en Colombia. 
              Piezas exclusivas, diseños que rompen el molde y la mejor calidad para los que no siguen tendencias, las crean.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/productos" 
                className="btn-primary inline-flex items-center justify-center gap-2 group text-lg py-4 px-8"
              >
                Ver Colección
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/productos?categoria=zapatos" 
                className="btn-secondary inline-flex items-center justify-center gap-2 text-lg py-4 px-8"
              >
                Sneakers
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-lc-border/50">
              <div>
                <p className="text-3xl font-heading font-bold text-lc-white">500+</p>
                <p className="text-sm text-lc-gray mt-1">Productos</p>
              </div>
              <div>
                <p className="text-3xl font-heading font-bold text-lc-white">24h</p>
                <p className="text-sm text-lc-gray mt-1">Envíos rápidos</p>
              </div>
              <div>
                <p className="text-3xl font-heading font-bold text-lc-white">100%</p>
                <p className="text-sm text-lc-gray mt-1">Garantía</p>
              </div>
            </div>
          </div>
          
          {/* Hero Images Grid */}
          <div className="hidden lg:grid grid-cols-2 gap-4 h-[600px] animate-fade-in delay-200">
            <div className="flex flex-col gap-4 mt-12">
              <div className="bg-lc-dark rounded-3xl overflow-hidden h-2/5 relative group border border-lc-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/accesorios.png" alt="Streetwear accesory" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 bg-lc-black" />
                <div className="absolute inset-0 bg-gradient-to-t from-lc-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Layers size={16} className="text-lc-pink" />
                  <span className="font-bold text-sm tracking-wide">ACCESORIOS</span>
                </div>
              </div>
              <div className="bg-lc-dark rounded-3xl overflow-hidden h-3/5 relative group border border-lc-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/ropa.png" alt="Streetwear clothing" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 bg-lc-black" />
                <div className="absolute inset-0 bg-gradient-to-t from-lc-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <Flame size={16} className="text-lc-purple-light" />
                  <span className="font-bold text-sm tracking-wide">PIEZAS ÚNICAS</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="bg-lc-dark rounded-3xl overflow-hidden h-3/5 relative group border border-lc-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/zapatos.png" alt="Streetwear model" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 bg-lc-black" />
                <div className="absolute inset-0 bg-gradient-to-t from-lc-black/60 to-transparent" />
                <div className="absolute top-4 right-4 bg-lc-white/10 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/20">HOT OUTFITS</div>
              </div>
              <div className="bg-lc-dark rounded-3xl overflow-hidden h-2/5 p-8 flex flex-col justify-center items-center text-center border border-lc-border relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-lc-purple/20 to-lc-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-2xl font-heading font-bold mb-2 relative z-10">¿Listo para el cambio?</h3>
                <p className="text-sm text-lc-gray relative z-10">Únete a la revolución urbana y lleva tu estilo al siguiente nivel.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
