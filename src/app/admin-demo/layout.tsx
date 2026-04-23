import { Sidebar } from "@/components/admin/Sidebar"
import { DemoModeBanner } from "@/components/admin/DemoModeBanner"
import { Command, Menu } from "lucide-react"

export const metadata = {
  title: "Admin Demo | LilCake",
}

export default function AdminDemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-lc-black font-body text-lc-white selection:bg-lc-purple/30">
      <Sidebar basePath="/admin-demo" demoMode />

      <main className="relative flex h-screen flex-1 flex-col overflow-hidden">
        <header className="z-10 flex shrink-0 items-center justify-between border-b border-lc-border bg-lc-card p-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-lc-purple p-1.5">
              <Command size={18} className="text-white" />
            </div>
            <span className="font-bold font-heading">Admin Demo</span>
          </div>
          <button className="text-lc-gray hover:text-lc-white">
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <DemoModeBanner />
          <div className="p-6 pb-24 lg:p-10">{children}</div>
        </div>
      </main>
    </div>
  )
}
