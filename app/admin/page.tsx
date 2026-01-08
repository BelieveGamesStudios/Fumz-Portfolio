import { AdminDashboard } from '@/components/admin-dashboard'
import { getAdminUser } from '@/app/actions/admin'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your portfolio content',
}

export default async function AdminPage() {
  // This will redirect to login if user is not authenticated
  await getAdminUser()

  return <AdminDashboard />
}
