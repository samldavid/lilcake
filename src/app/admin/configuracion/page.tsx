import { BusinessSettingsForm } from "@/components/admin/BusinessSettingsForm"
import { getBusinessSettingsView } from "@/lib/business-settings"

export default async function AdminSettingsPage() {
  const settings = await getBusinessSettingsView()

  return (
    <div className="animate-fade-in">
      <BusinessSettingsForm initialSettings={settings} />
    </div>
  )
}
