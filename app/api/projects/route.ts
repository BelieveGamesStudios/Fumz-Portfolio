import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Fetch all projects (removed user filter for public access)
  const { data, error } = await supabase
    .from('projects')
    .select('*')
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
    video_url: project.video_url || null,
    download_url: project.download_url || null,
    screenshots: project.screenshots || [],
    created_at: project.created_at,
    updated_at: project.updated_at,
  }))

  return Response.json(projects)
}
