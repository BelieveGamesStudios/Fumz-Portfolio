'use server'

import { createClient } from '@/lib/supabase/server'
import { DEFAULT_SKILL_CATEGORIES, validateSkillCategories, type SkillCategory } from '@/lib/skills'

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

export async function getPublicSkillCategories(): Promise<SkillCategory[] | null> {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('skill_sections')
            .select('categories')
            .order('user_id', { ascending: true })
            .limit(1)
            .maybeSingle()

        if (error) throw error
        // A saved empty array is intentional; only an absent row uses defaults.
        return validateSkillCategories(data ? data.categories : DEFAULT_SKILL_CATEGORIES)
    } catch (err) {
        console.error('Public skills fetch error:', err)
        return null
    }
}

export async function getPublicSocialLinks(): Promise<Record<string, string>> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('social_links')
            .select('platform, url')

        if (error) {
            console.error('Public social links fetch error:', error)
            return {}
        }

        const map: Record<string, string> = {}
        data?.forEach((row: { platform: string; url: string }) => {
            if (row.url && row.url.trim().length > 0) {
                map[row.platform.toLowerCase()] = row.url.trim()
            }
        })
        return map
    } catch (err) {
        console.error('Error in getPublicSocialLinks:', err)
        return {}
    }
}
