import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Return empty object for unauthenticated users
    return Response.json({})
  }

  try {
    const { data, error } = await supabase
      .from('about_section')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      console.error('Error fetching about section:', error)
      return Response.json({})
    }

    return Response.json(data)
  } catch (err) {
    console.error('Error in about section API:', err)
    return Response.json({})
  }
}
