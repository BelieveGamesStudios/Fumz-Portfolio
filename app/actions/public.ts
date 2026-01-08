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

export async function getPublicAboutSection() {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('about_section')
            .select('*')
            .single()

        if (error) {
            // It's normal to have no about section initially
            if (error.code === 'PGRST116') return null
            console.error('Public about section fetch error:', error)
            return null
        }
        return data
    } catch (err) {
        console.error('Error in getPublicAboutSection:', err)
        return null
    }
}

export async function getPublicSkills() {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('skill_levels')
            .select('*')
            .order('category', { ascending: true })

        if (error) {
            console.error('Public skills fetch error:', error)
            return []
        }
        return data || []
    } catch (err) {
        console.error('Error in getPublicSkills:', err)
        return []
    }
}
