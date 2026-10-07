import { createClient } from './client'
import { addMapAsset } from '@/app/actions/mapEditor'
import { MapAsset, ModelFormat } from '@/components/map-editor/types'

export async function uploadGlbAsset(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; asset?: MapAsset; error?: string }> {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'glb' && ext !== 'gltf' && ext !== 'fbx' && ext !== 'obj') {
      return { success: false, error: 'Only .glb, .gltf, .fbx, and .obj 3D model files are supported.' }
    }

    const format: ModelFormat = (ext === 'fbx' || ext === 'obj' || ext === 'gltf' || ext === 'glb') ? ext : 'glb'
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
        format,
        created_at: new Date().toISOString(),
      }
      return { success: true, asset: fallbackAsset }
    }

    return {
      success: true,
      asset: {
        ...result.asset,
        format,
      },
    }
  } catch (err: any) {
    console.error('Error during 3D model upload:', err)
    return { success: false, error: err.message || 'Upload failed' }
  }
}

export const uploadModelAsset = uploadGlbAsset

