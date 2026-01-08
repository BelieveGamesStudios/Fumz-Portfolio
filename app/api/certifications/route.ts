import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Use a service role client for public reads so this endpoint can return
    // certifications without relying on the request's auth cookie. This also
    // avoids RLS issues for unauthenticated requests.
    const { createServiceRoleClient } = await import('@/lib/supabase/server')
    const service = createServiceRoleClient()

    const { data: certs, error } = await service
      .from('certifications')
      .select('*')
      .order('issued_date', { ascending: false })

    if (error) {
      console.error('Error fetching certifications (service):', error)
      return Response.json([])
    }

    return Response.json(certs || [])
  } catch (error) {
    console.error('API error:', error)
    return Response.json([])
  }
}