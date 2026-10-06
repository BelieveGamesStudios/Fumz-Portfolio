import { getAdminUser } from '@/app/actions/admin'
import { MapEditor } from '@/components/map-editor/MapEditor'

export const metadata = {
  title: 'City Map Editor | Admin',
  description: 'Interactive 3D map editor for buildings and traffic waypoints in full view',
}

export default async function AdminMapPage() {
  // Ensure user is authenticated, otherwise redirects to /login
  await getAdminUser()

  return <MapEditor fullScreen={true} />
}
