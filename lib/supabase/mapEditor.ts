import { createClient } from './client'
import { addMapAsset } from '@/app/actions/mapEditor'
import { MapAsset } from '@/components/map-editor/types'

export async function uploadGlbAsset(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; asset?: MapAsset; error?: string }> {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'glb' && ext !== 'gltf') {
      return { success: false, error: 'Only .glb and .gltf files are supported.' }
    }

    const supabase = createClient()
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `models/${Date.now()}_${cleanName}`

    // Upload to 'city-assets' bucket
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('city-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

    let publicUrl = ''

    if (uploadErr) {
      console.warn('Supabase storage upload error, falling back to local object URL:', uploadErr.message)
      // Provide object URL so user can still test in editor even if bucket policy is pending
      publicUrl = URL.createObjectURL(file)
    } else {
      const { data: urlData } = supabase.storage
        .from('city-assets')
        .getPublicUrl(filePath)
      publicUrl = urlData.publicUrl
    }

    // Register in map_assets table
    const result = await addMapAsset({
      name: file.name.replace(/\.[^/.]+$/, ''),
      file_url: publicUrl,
      file_size: file.size,
    })

    if (!result.success || !result.asset) {
      // Fallback asset representation if DB table is pending setup
      const fallbackAsset: MapAsset = {
        id: `local-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        file_url: publicUrl,
        file_size: file.size,
        created_at: new Date().toISOString(),
      }
      return { success: true, asset: fallbackAsset }
    }

    return { success: true, asset: result.asset }
  } catch (err: any) {
    console.error('Error during GLB upload:', err)
    return { success: false, error: err.message || 'Upload failed' }
  }
}
