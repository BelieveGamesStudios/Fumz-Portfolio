'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

// Projects actions
export async function getProjects() {
  const supabase = await createClient()
  const user = await getAdminUser()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addProject(projectData: {
  title: string
  description: string
  category: string
  image: string
  platforms: string[]
  link: string
  video_url?: string
  screenshots?: Array<{ url: string; caption?: string }>
}) {
  const supabase = await createClient()
  const user = await getAdminUser()

  const { data, error } = await supabase
    .from('projects')
    .insert([
      {
        user_id: user.id,
        title: projectData.title,
        description: projectData.description,
        category: projectData.category,
        image_url: projectData.image,
        platform: projectData.platforms.join(','),
        featured: false,
        video_url: projectData.video_url || null,
        screenshots: projectData.screenshots || [],
      },
    ])
    .select()

  if (error) throw error
  return data[0]
}

export async function updateProject(
  projectId: string,
  projectData: {
    title: string
    description: string
    category: string
    image: string
    platforms: string[]
    link: string
    video_url?: string
    screenshots?: Array<{ url: string; caption?: string }>
  }
) {
  const supabase = await createClient()
  const user = await getAdminUser()

  const { data, error } = await supabase
    .from('projects')
    .update({
      title: projectData.title,
      description: projectData.description,
      category: projectData.category,
      image_url: projectData.image,
      platform: projectData.platforms.join(','),
      video_url: projectData.video_url || null,
      screenshots: projectData.screenshots || [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select()

  if (error) throw error
  return data[0]
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const user = await getAdminUser()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) throw error
}

// About section actions
export async function getAboutSection() {
  const supabase = await createClient()
  const user = await getAdminUser()

  const { data, error } = await supabase
    .from('about_section')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // It's okay if there's no about section yet
  if (error?.code === 'PGRST116') {
    return null
  }

  if (error) throw error
  return data
}

export async function updateAboutSection(aboutData: {
  title: string
  content: string
  image_url?: string
}) {
  const supabase = await createClient()
  const user = await getAdminUser()

  // Check if about section exists
  const existing = await getAboutSection()

  if (existing) {
    const { data, error } = await supabase
      .from('about_section')
      .update({
        title: aboutData.title,
        content: aboutData.content,
        image_url: aboutData.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()

    if (error) throw error
    return data[0]
  } else {
    const { data, error } = await supabase
      .from('about_section')
      .insert([
        {
          user_id: user.id,
          title: aboutData.title,
          content: aboutData.content,
          image_url: aboutData.image_url,
        },
      ])
      .select()

    if (error) throw error
    return data[0]
  }
}

// Contact submissions actions
export async function getContactSubmissions() {
  const supabase = await createClient()
  await getAdminUser() // Verify admin access

  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function markContactAsRead(submissionId: string) {
  const supabase = await createClient()
  await getAdminUser()

  const { error } = await supabase
    .from('contact_submissions')
    .update({ read: true })
    .eq('id', submissionId)

  if (error) throw error
}

export async function archiveContact(submissionId: string) {
  const supabase = await createClient()
  await getAdminUser()

  const { error } = await supabase
    .from('contact_submissions')
    .update({ archived: true })
    .eq('id', submissionId)

  if (error) throw error
}

export async function deleteContact(submissionId: string) {
  const supabase = await createClient()
  await getAdminUser()

  const { error } = await supabase
    .from('contact_submissions')
    .delete()
    .eq('id', submissionId)

  if (error) throw error
}

export async function submitContactForm(formData: {
  name: string
  email: string
  subject?: string
  message: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('contact_submissions')
    .insert([
      {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      },
    ])

  if (error) throw error
}

// Skills actions
export async function getSkills() {
  const supabase = await createClient()
  const user = await getAdminUser()

  const { data, error } = await supabase
    .from('skill_levels')
    .select('*')
    .eq('user_id', user.id)
    .order('category', { ascending: true })

  if (error) throw error
  return data || []
}

// Certifications actions
export async function getCertifications() {
  const supabase = await createClient()
  const user = await getAdminUser()

  try {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_date', { ascending: false })

    if (error) {
      console.error('Certifications fetch error:', error.message, error.details, error.hint)
      throw new Error(`Failed to fetch certifications: ${error.message}`)
    }
    return data || []
  } catch (err: any) {
    console.error('Error in getCertifications:', err)
    throw err
  }
}

export async function addCertification(cert: { title: string; issuer: string; issued_date?: string; credential_url?: string }) {
  const supabase = await createClient()
  const user = await getAdminUser()

  try {
    console.log('Adding certification for user:', user.id)
    console.log('Certification data:', cert)

    // Use a service-role client for the insert to avoid RLS issues while
    // still verifying the request via getAdminUser() above.
    const { createServiceRoleClient } = await import('@/lib/supabase/server')
    const service = createServiceRoleClient()

    const { data, error } = await service
      .from('certifications')
      .insert([
        {
          user_id: user.id,
          title: cert.title,
          issuer: cert.issuer,
          issued_date: cert.issued_date || null,
          credential_url: cert.credential_url || null,
        },
      ])
      .select()

    if (error) {
      console.error('Certification insert error - Message:', error.message)
      console.error('Certification insert error - Details:', error.details)
      console.error('Certification insert error - Hint:', error.hint)
      console.error('Certification insert error - Code:', error.code)
      
      if (error.message?.includes('row-level security')) {
        throw new Error('RLS policy prevents insert. The certifications table may not exist or RLS policies are not configured. Run the SQL setup script from SETUP_MISSING_TABLES.md')
      }
      
      if (error.code === 'PGRST116') {
        throw new Error('The certifications table does not exist. Please run the SQL setup script from SETUP_MISSING_TABLES.md')
      }
      
      throw new Error(`Failed to add certification: ${error.message}`)
    }
    
    console.log('Certification added successfully (service client):', data)
    return data[0]
  } catch (err: any) {
    console.error('Error in addCertification:', err)
    throw err
  }
}

export async function deleteCertification(certId: string) {
  const supabase = await createClient()
  const user = await getAdminUser()

  const { error } = await supabase
    .from('certifications')
    .delete()
    .eq('id', certId)
    .eq('user_id', user.id)

  if (error) throw error
}
export async function updateSkillLevel(skillName: string, level: number, category: string) {
  const supabase = await createClient()
  const user = await getAdminUser()

  if (level < 0 || level > 100) {
    throw new Error('Skill level must be between 0 and 100')
  }

  try {
    // Try to find existing skill
    const { data: existing, error: selectError } = await supabase
      .from('skill_levels')
      .select('id')
      .eq('user_id', user.id)
      .eq('skill_name', skillName)

    if (selectError) {
      console.error('Error selecting skill:', selectError)
      throw selectError
    }

    if (existing && existing.length > 0) {
      // Update existing
      const { error } = await supabase
        .from('skill_levels')
        .update({
          level,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing[0].id)

      if (error) {
        console.error('Error updating skill:', error)
        throw error
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('skill_levels')
        .insert([
          {
            user_id: user.id,
            skill_name: skillName,
            level,
            category,
          },
        ])

      if (error) {
        console.error('Error inserting skill:', error)
        throw error
      }
    }
  } catch (error) {
    console.error('Skill level update failed:', error)
    throw error
  }
}

export async function deleteSkill(skillName: string) {
  const supabase = await createClient()
  const user = await getAdminUser()

  const { error } = await supabase
    .from('skill_levels')
    .delete()
    .eq('user_id', user.id)
    .eq('skill_name', skillName)

  if (error) throw error
}
