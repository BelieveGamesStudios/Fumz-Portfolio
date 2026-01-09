import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('start_date', { ascending: false })

    if (error) {
        console.error('Error fetching experiences:', error)
        return Response.json([], { status: 500 })
    }

    // Transform if needed, but raw data is probably fine if it matches interface
    return Response.json(data)
}
