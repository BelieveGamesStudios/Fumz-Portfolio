'use server'

import { createClient } from '@/lib/supabase/server'

export async function getPublicCertifications() {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('certifications')
            .select('*')
            .order('issued_date', { ascending: false })

        if (error) {
            console.error('Public certifications fetch error:', error)
            return []
        }
        return data || []
    } catch (err) {
        console.error('Error in getPublicCertifications:', err)
        return []
    }
}
