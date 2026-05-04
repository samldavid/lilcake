import { BusinessSettingsForm } from "@/components/admin/BusinessSettingsForm"
import {
  ADMIN_DEMO_NOTICE,
} from "@/lib/admin-demo-data"
import { getDemoBusinessSettingsView } from "@/lib/business-settings"

export default function AdminDemoSettingsPage() {
  return (
    <div className="animate-fade-in">
      <BusinessSettingsForm
        initialSettings={getDemoBusinessSettingsView()}
        mode="demo"
        demoNotice={ADMIN_DEMO_NOTICE}
      />
    </div>
  )
}
