import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell"
import { DemoModeBanner } from "@/components/admin/DemoModeBanner"

export const metadata = {
  title: "Admin Demo | LilCake",
}

export default function AdminDemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutShell
      basePath="/admin-demo"
      demoMode
      mobileTitle="Admin Demo"
      banner={<DemoModeBanner />}
    >
      {children}
    </AdminLayoutShell>
  )
}
