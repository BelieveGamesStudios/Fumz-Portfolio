import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json([])
    }

    const { data: skills, error } = await supabase
      .from('skill_levels')
      .select('*')
      .eq('user_id', user.id)
      .order('category', { ascending: true })

    if (error) {
      console.error('Error fetching skills:', error)
      return Response.json([])
    }

    return Response.json(skills || [])
  } catch (error) {
    console.error('API error:', error)
    return Response.json([])
  }
}
