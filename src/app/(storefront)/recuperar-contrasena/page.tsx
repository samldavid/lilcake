import { Card, CardBody, CardHeader } from "@/components/ui/Card"
import { ForgotPasswordForm } from "./ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lc-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md animate-fade-in">
        <Card glass className="relative z-10 w-full rounded-lg">
          <CardHeader className="border-b border-lc-border text-center">
            <h2 className="text-3xl font-bold text-lc-white">
              Recupera tu acceso
            </h2>
            <p className="mt-2 text-sm text-lc-gray">
              Te enviaremos un enlace para crear una contraseña nueva.
            </p>
          </CardHeader>
          <CardBody className="p-8">
            <ForgotPasswordForm />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
