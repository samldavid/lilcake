import Link from "next/link"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"

type VerifyEmailPageProps = {
  searchParams: Promise<{
    status?: string | string[]
  }>
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams
  const statusValue = params.status
  const status = Array.isArray(statusValue) ? statusValue[0] : statusValue
  const success = status === "success"

  return (
    <div className="min-h-screen flex items-center justify-center bg-lc-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md animate-fade-in">
        <Card glass className="relative z-10 w-full rounded-lg">
          <CardHeader className="border-b border-lc-border text-center">
            <h2 className="text-3xl font-bold text-lc-white">
              {success ? "Correo verificado" : "No pudimos verificar tu correo"}
            </h2>
            <p className="mt-2 text-sm text-lc-gray">
              {success
                ? "Tu cuenta ya quedo confirmada y lista para seguir comprando."
                : "El enlace no es valido o ya vencio. Puedes pedir uno nuevo desde tu cuenta."}
            </p>
          </CardHeader>
          <CardBody className="space-y-4 p-8">
            <Link
              href={success ? "/login?verified=true" : "/cuenta"}
              className="inline-flex w-full items-center justify-center rounded-full h-11 px-8 text-sm font-semibold transition-all btn-primary"
            >
              {success ? "Ir al login" : "Ir a mi cuenta"}
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
