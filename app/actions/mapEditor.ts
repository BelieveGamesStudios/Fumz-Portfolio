'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { CityMapConfig, MapAsset, DEFAULT_BUILDINGS } from '@/components/map-editor/types'
import { revalidatePath } from 'next/cache'

async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

/**
 * Public action: Fetches the active published map configuration.
 * Called by the public city scene on the homepage.
 */
export async function getPublishedMapConfig(): Promise<CityMapConfig | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('city_map_configs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.warn('Could not fetch published map config:', error.message)
      return null
    }

    if (!data) return null

    const rawWaypoints = data.waypoints || {}
    const disabled_routes: string[] =
      data.disabled_routes || (rawWaypoints._disabled_routes as string[]) || []

    const cleanWaypoints = { ...rawWaypoints }
    delete cleanWaypoints._disabled_routes

    return {
      id: data.id,
      status: 'published',
      buildings: data.buildings || DEFAULT_BUILDINGS,
      waypoints: cleanWaypoints,
      disabled_routes,
      published_at: data.published_at,
      updated_at: data.updated_at,
    }
  } catch (err) {
    console.warn('Error reading published map:', err)
    return null
  }
}

/**
 * Admin action: Fetches current draft configuration (or published if no draft).
 */
export async function getDraftMapConfig(): Promise<CityMapConfig | null> {
  const user = await getAdminUser()
  if (!user) return null

  const supabase = await createClient()

  // 1. Try to find a draft first
  const { data: draftData, error: draftErr } = await supabase
    .from('city_map_configs')
    .select('*')
    .eq('status', 'draft')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (draftData) {
    const rawWaypoints = draftData.waypoints || {}
    const disabled_routes: string[] =
      draftData.disabled_routes || (rawWaypoints._disabled_routes as string[]) || []

    const cleanWaypoints = { ...rawWaypoints }
    delete cleanWaypoints._disabled_routes

    return {
      id: draftData.id,
      status: 'draft',
      buildings: draftData.buildings || DEFAULT_BUILDINGS,
      waypoints: cleanWaypoints,
      disabled_routes,
      published_at: draftData.published_at,
      updated_at: draftData.updated_at,
    }
  }

  // 2. Fall back to latest published config
  const { data: pubData } = await supabase
    .from('city_map_configs')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (pubData) {
    const rawWaypoints = pubData.waypoints || {}
    const disabled_routes: string[] =
      pubData.disabled_routes || (rawWaypoints._disabled_routes as string[]) || []

    const cleanWaypoints = { ...rawWaypoints }
    delete cleanWaypoints._disabled_routes

    return {
      id: pubData.id,
      status: 'published',
      buildings: pubData.buildings || DEFAULT_BUILDINGS,
      waypoints: cleanWaypoints,
      disabled_routes,
      published_at: pubData.published_at,
      updated_at: pubData.updated_at,
    }
  }

  return null
}

/**
 * Admin action: Save current scene as draft.
 */
export async function saveDraftMapConfig(config: {
  buildings: CityMapConfig['buildings']
  waypoints: CityMapConfig['waypoints']
  disabled_routes?: string[]
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const user = await getAdminUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()

    const waypointsPayload = {
      ...config.waypoints,
      _disabled_routes: config.disabled_routes || [],
    }

    // Check if an existing draft exists
    const { data: existingDraft } = await supabase
      .from('city_map_configs')
      .select('id')
      .eq('status', 'draft')
      .limit(1)
      .maybeSingle()

    if (existingDraft?.id) {
      const { error } = await supabase
        .from('city_map_configs')
        .update({
          buildings: config.buildings,
          waypoints: waypointsPayload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDraft.id)

      if (error) throw error
      return { success: true, id: existingDraft.id }
    } else {
      const { data, error } = await supabase
        .from('city_map_configs')
        .insert([
          {
            user_id: user.id,
            status: 'draft',
            buildings: config.buildings,
            waypoints: waypointsPayload,
            updated_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single()

      if (error) throw error
      return { success: true, id: data?.id }
    }
  } catch (err: any) {
    console.error('Error saving draft map:', err)
    return { success: false, error: err.message || 'Failed to save draft' }
  }
}

/**
 * Admin action: Publish current scene live to production!
 */
export async function publishMapConfig(config: {
  buildings: CityMapConfig['buildings']
  waypoints: CityMapConfig['waypoints']
  disabled_routes?: string[]
}): Promise<{ success: boolean; publishedAt?: string; error?: string }> {
  try {
    const user = await getAdminUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()
    const now = new Date().toISOString()

    const waypointsPayload = {
      ...config.waypoints,
      _disabled_routes: config.disabled_routes || [],
    }

    // Check if existing published config exists to update or insert
    const { data: existingPub } = await supabase
      .from('city_map_configs')
      .select('id')
      .eq('status', 'published')
      .limit(1)
      .maybeSingle()

    if (existingPub?.id) {
      const { error } = await supabase
        .from('city_map_configs')
        .update({
          buildings: config.buildings,
          waypoints: waypointsPayload,
          published_at: now,
          updated_at: now,
        })
        .eq('id', existingPub.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from('city_map_configs').insert([
        {
          user_id: user.id,
          status: 'published',
          buildings: config.buildings,
          waypoints: waypointsPayload,
          published_at: now,
          updated_at: now,
        },
      ])

      if (error) throw error
    }

    revalidatePath('/')
    return { success: true, publishedAt: now }
  } catch (err: any) {
    console.error('Error publishing map config:', err)
    return { success: false, error: err.message || 'Failed to publish' }
  }
}

/**
 * Admin action: Get uploaded map assets (.glb files)
 */
export async function getMapAssets(): Promise<MapAsset[]> {
  try {
    const user = await getAdminUser()
    if (!user) return []

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('map_assets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Could not fetch map assets:', error.message)
      return []
    }

    return (data || []) as MapAsset[]
  } catch (err) {
    console.warn('Error fetching map assets:', err)
    return []
  }
}

/**
 * Admin action: Register newly uploaded asset
 */
export async function addMapAsset(asset: {
  name: string
  file_url: string
  file_size?: number
}): Promise<{ success: boolean; asset?: MapAsset; error?: string }> {
  try {
    const user = await getAdminUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('map_assets')
      .insert([
        {
          user_id: user.id,
          name: asset.name,
          file_url: asset.file_url,
          file_size: asset.file_size || 0,
        },
      ])
      .select('*')
      .single()

    if (error) throw error
    return { success: true, asset: data as MapAsset }
  } catch (err: any) {
    console.error('Error adding map asset:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Admin action: Delete asset
 */
export async function deleteMapAsset(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAdminUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()
    const { error } = await supabase.from('map_assets').delete().eq('id', id)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
