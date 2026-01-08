import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Get authenticated user to retrieve their projects
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Return empty array for unauthenticated users
    return Response.json([])
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return Response.json([], { status: 500 })
  }

  // Transform database format to frontend format
  const projects = data.map((project: any) => ({
    id: project.id,
    title: project.title,
    description: project.description || '',
    category: project.category,
    image: project.image_url || '/placeholder.jpg',
    platforms: project.platform ? project.platform.split(',').map((p: string) => p.trim()) : [],
    link: `/projects/${project.id}`,
    featured: project.featured,
    created_at: project.created_at,
    updated_at: project.updated_at,
  }))

  return Response.json(projects)
}
