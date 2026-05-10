import { RegisterForm } from "./RegisterForm"
import { googleAuthEnabled } from "@/lib/auth"
import { Card, CardBody, CardHeader } from "@/components/ui/Card"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-lc-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative mt-8 mb-8 w-full max-w-md animate-fade-in">
        <Card glass className="relative z-10 w-full rounded-lg">
          <CardHeader className="border-b border-lc-border text-center">
            <h2 className="text-3xl font-bold text-lc-white">
              Únete a LilCake
            </h2>
            <p className="mt-2 text-sm text-lc-gray">
              Crea tu cuenta para comprar de manera más rápida.
            </p>
          </CardHeader>
          <CardBody className="p-8">
            <RegisterForm
              googleEnabled={googleAuthEnabled}
              termsError={params.error === "terms"}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
