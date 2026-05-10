import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { ResetPasswordForm } from "./ResetPasswordForm"

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[]
    mode?: string | string[]
  }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams
  const tokenValue = params.token
  const modeValue = params.mode
  const token = Array.isArray(tokenValue) ? tokenValue[0] : tokenValue || ""
  const mode = Array.isArray(modeValue) ? modeValue[0] : modeValue || ""

  return (
    <div className="min-h-screen flex items-center justify-center bg-lc-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md animate-fade-in">
        <Card glass className="relative z-10 w-full rounded-lg">
          <CardHeader className="border-b border-lc-border text-center">
            <h2 className="text-3xl font-bold text-lc-white">
              {mode === "account-change"
                ? "Cambia tu contraseña"
                : "Restablece tu contraseña"}
            </h2>
            <p className="mt-2 text-sm text-lc-gray">
              Crea una clave nueva para volver a entrar con seguridad.
            </p>
          </CardHeader>
          <CardBody className="p-8">
            <ResetPasswordForm token={token} mode={mode} />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
