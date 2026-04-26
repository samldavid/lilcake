import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell"
import { requireAdminPageAccess } from "@/lib/auth-guards"

export const metadata = {
  title: "Admin Panel | LilCake",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdminPageAccess()

  return (
    <AdminLayoutShell basePath="/admin" mobileTitle="Admin Panel">
      {children}
    </AdminLayoutShell>
  )
}
