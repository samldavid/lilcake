import { AdminDemoProductFormClient } from "@/components/admin-demo/AdminDemoProductFormClient"

export default async function AdminDemoEditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <AdminDemoProductFormClient productId={id} />
}
