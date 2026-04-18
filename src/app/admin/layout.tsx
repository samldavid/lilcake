import { Sidebar } from "@/components/admin/Sidebar"
import { Menu, Command } from "lucide-react"

export const metadata = {
  title: "Admin Panel | LilCake",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-lc-black text-lc-white font-body selection:bg-lc-purple/30">
      
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-lc-card border-b border-lc-border p-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-lc-purple p-1.5 rounded-lg">
              <Command size={18} className="text-white" />
            </div>
            <span className="font-bold font-heading">Admin</span>
          </div>
          <button className="text-lc-gray hover:text-lc-white">
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="p-6 lg:p-10 pb-24">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
