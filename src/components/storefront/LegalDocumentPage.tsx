import Link from "next/link"

type LegalSection = {
  id: string
  title: string
  paragraphs?: string[]
  items?: string[]
}

type LegalDocumentPageProps = {
  eyebrow: string
  title: string
  subtitle: string
  lastUpdated: string
  contactEmail: string
  sections: LegalSection[]
}

export function LegalDocumentPage({
  eyebrow,
  title,
  subtitle,
  lastUpdated,
  contactEmail,
  sections,
}: LegalDocumentPageProps) {
  return (
    <div className="animate-fade-in">
      <section className="border-b border-lc-border bg-[radial-gradient(circle_at_top_left,rgba(108,60,225,0.18),transparent_42%),radial-gradient(circle_at_top_right,rgba(233,30,140,0.14),transparent_38%)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-lc-cyan">
                {eyebrow}
              </p>
              <h1 className="mb-4 text-4xl font-heading font-bold text-lc-white sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-lc-gray-light sm:text-lg">
                {subtitle}
              </p>
            </div>

            <div className="rounded-lg border border-lc-border bg-lc-darker/80 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
              <div className="mb-5 inline-flex rounded-full border border-lc-purple/30 bg-lc-purple/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-lc-purple-light">
                Documento vigente
              </div>
              <div className="space-y-4 text-sm text-lc-gray-light">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.24em] text-lc-gray">
                    Última actualización
                  </p>
                  <p className="font-semibold text-lc-white">{lastUpdated}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-[0.24em] text-lc-gray">
                    Contacto
                  </p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="font-semibold text-lc-cyan transition-colors hover:text-lc-white"
                  >
                    {contactEmail}
                  </a>
                </div>
                <div className="rounded-lg border border-lc-border bg-lc-dark/70 p-4 text-sm leading-7 text-lc-gray-light">
                  Si necesitas ejercer derechos sobre tus datos o resolver una duda
                  legal sobre una compra, puedes escribirnos directamente y te
                  responderemos por ese mismo medio.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8 lg:py-14">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-lg border border-lc-border bg-lc-darker/80 p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-lc-gray">
              En esta página
            </p>
            <nav className="space-y-2">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-start gap-3 rounded-lg px-3 py-3 text-sm text-lc-gray-light transition-colors hover:bg-lc-dark hover:text-lc-white"
                >
                  <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-lc-border text-[11px] font-semibold text-lc-purple-light">
                    {index + 1}
                  </span>
                  <span className="leading-6">{section.title}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="space-y-5">
          {sections.map((section, index) => (
            <article
              id={section.id}
              key={section.id}
              className="scroll-mt-28 rounded-lg border border-lc-border bg-lc-darker/82 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.22)] sm:p-8"
            >
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-lc-purple/12 text-sm font-bold text-lc-purple-light">
                  {index + 1}
                </span>
                <h2 className="text-2xl font-heading font-bold text-lc-white">
                  {section.title}
                </h2>
              </div>

              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mb-4 text-sm leading-8 text-lc-gray-light last:mb-0 sm:text-[15px]"
                >
                  {paragraph}
                </p>
              ))}

              {section.items?.length ? (
                <ul className="mt-5 grid gap-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-lc-border bg-lc-dark/65 px-4 py-3 text-sm leading-7 text-lc-gray-light"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}

          <div className="rounded-lg border border-lc-border bg-lc-dark/65 p-6 text-sm leading-7 text-lc-gray-light sm:p-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-lc-gray">
              Soporte
            </p>
            <p>
              Si necesitas ayuda con un pedido, una devolución o una solicitud
              relacionada con estos documentos, puedes escribirnos a{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="font-semibold text-lc-cyan transition-colors hover:text-lc-white"
              >
                {contactEmail}
              </a>
              .
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/ayuda" className="btn-secondary">
                Ir al centro de ayuda
              </Link>
              <Link href="/productos" className="btn-primary">
                Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
