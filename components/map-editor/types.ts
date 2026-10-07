export type BuildingType = 'portfolio' | 'decorative' | 'glb' | 'model'

export type BuildingModalType =
  | 'none'
  | 'projects'
  | 'about'
  | 'experience'
  | 'skills'
  | 'certifications'
  | 'contact'
  | 'custom'

export interface BuildingModalConfig {
  type: BuildingModalType
  customTitle?: string
  customSubtitle?: string
  customContent?: string // Sanitized markdown or plain text
  customLink?: string
  customLinkLabel?: string
}

export type ModelFormat = 'glb' | 'gltf' | 'fbx' | 'obj'

export interface PlacedBuilding {
  id: string
  name: string
  type: BuildingType
  glb_url?: string // Kept for backward compatibility
  model_url?: string // Universal 3D model asset URL
  model_format?: ModelFormat
  position: [number, number, number]
  rotation: [number, number, number] // in radians [x, y, z]
  scale: [number, number, number]
  color?: string
  label?: string
  interaction?: BuildingModalConfig
}

export type RouteWaypointMap = Record<string, [number, number, number][]>

export interface CityMapConfig {
  id?: string
  status: 'draft' | 'published'
  buildings: PlacedBuilding[]
  waypoints: RouteWaypointMap
  disabled_routes?: string[]
  published_at?: string | null
  updated_at?: string
  created_at?: string
}

export interface MapAsset {
  id: string
  name: string
  file_url: string
  file_size?: number
  format?: ModelFormat
  created_at?: string
}

/**
 * Validates whether a given URL is safe for navigation (http, https, or mailto).
 * Rejects javascript:, data:, vbscript:, and other potentially malicious schemes.
 */
export function isValidSafeUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed) return false

  // Relative path starting with / or # is allowed
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true

  try {
    const parsed = new URL(trimmed)
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Normalizes a building's interaction config with defaults.
 */
export function normalizeBuildingInteraction(building: PlacedBuilding): BuildingModalConfig {
  if (building.interaction) {
    return building.interaction
  }

  // Fallback defaults based on id / type / label
  const idLower = building.id.toLowerCase()
  const labelLower = (building.label || '').toLowerCase()

  if (idLower.includes('prj') || labelLower.includes('project')) return { type: 'projects' }
  if (idLower.includes('abt') || labelLower.includes('about')) return { type: 'about' }
  if (idLower.includes('exp') || labelLower.includes('experience')) return { type: 'experience' }
  if (idLower.includes('skl') || labelLower.includes('skill')) return { type: 'skills' }
  if (idLower.includes('cert') || labelLower.includes('certif')) return { type: 'certifications' }
  if (idLower.includes('cnt') || labelLower.includes('contact')) return { type: 'contact' }
  if (idLower.includes('soc') || labelLower.includes('social')) return { type: 'contact' }

  if (building.type === 'portfolio') return { type: 'about' }
  return { type: 'none' }
}

export const DEFAULT_BUILDINGS: PlacedBuilding[] = [
  // Core Portfolio Buildings
  { 
    id: 'b-cert', 
    name: 'Certifications Tower', 
    type: 'portfolio', 
    label: 'CERTIFICATIONS', 
    color: '#9f5535', 
    position: [0, 0, -15], 
    scale: [6, 12, 6], 
    rotation: [0, 0, 0],
    interaction: { type: 'certifications' }
  },
  { 
    id: 'b-edu', 
    name: 'Education Building', 
    type: 'portfolio', 
    label: 'ABOUT & BIO', 
    color: '#c18564', 
    position: [0, 0, -25], 
    scale: [5, 10, 5], 
    rotation: [0, 0, 0],
    interaction: { type: 'about' }
  },
  { 
    id: 'b-exp', 
    name: 'Experience Hub', 
    type: 'portfolio', 
    label: 'EXPERIENCE', 
    color: '#765b4d', 
    position: [15, 0, 0], 
    scale: [8, 15, 8], 
    rotation: [0, 0, 0],
    interaction: { type: 'experience' }
  },
  { 
    id: 'b-abt', 
    name: 'About Pavilion', 
    type: 'portfolio', 
    label: 'ABOUT', 
    color: '#d0a083', 
    position: [-15, 0, 0], 
    scale: [7, 8, 7], 
    rotation: [0, 0, 0],
    interaction: { type: 'about' }
  },
  { 
    id: 'b-prj', 
    name: 'Projects Complex', 
    type: 'portfolio', 
    label: 'PROJECTS', 
    color: '#87482d', 
    position: [0, 0, 15], 
    scale: [8, 14, 8], 
    rotation: [0, 0, 0],
    interaction: { type: 'projects' }
  },
  { 
    id: 'b-soc', 
    name: 'Socials Station', 
    type: 'portfolio', 
    label: 'SOCIALS & CONTACT', 
    color: '#a96647', 
    position: [15, 0, 15], 
    scale: [5, 6, 5], 
    rotation: [0, 0, 0],
    interaction: { type: 'contact' }
  },
  { 
    id: 'b-skl', 
    name: 'Skills Spire', 
    type: 'portfolio', 
    label: 'SKILLS', 
    color: '#bc7451', 
    position: [-15, 0, 15], 
    scale: [6, 9, 6], 
    rotation: [0, 0, 0],
    interaction: { type: 'skills' }
  },
  { 
    id: 'b-cnt', 
    name: 'Contact Kiosk', 
    type: 'portfolio', 
    label: 'CONTACT', 
    color: '#6d3d2d', 
    position: [0, 0, 25], 
    scale: [6, 7, 6], 
    rotation: [0, 0, 0],
    interaction: { type: 'contact' }
  },

  // Decorative Buildings (Skyline Context)
  { id: 'b-dec1', name: 'Tower A', type: 'decorative', position: [25, 0, -20], scale: [4, 18, 4], rotation: [0, 0, 0], color: '#78675f', interaction: { type: 'none' } },
  { id: 'b-dec2', name: 'Tower B', type: 'decorative', position: [-25, 0, -15], scale: [5, 22, 5], rotation: [0, 0, 0], color: '#6b5a52', interaction: { type: 'none' } },
  { id: 'b-dec3', name: 'Block C', type: 'decorative', position: [20, 0, -30], scale: [3, 10, 3], rotation: [0, 0, 0], color: '#8b7468', interaction: { type: 'none' } },
  { id: 'b-dec4', name: 'Block D', type: 'decorative', position: [-20, 0, -25], scale: [6, 15, 6], rotation: [0, 0, 0], color: '#745c50', interaction: { type: 'none' } },
  { id: 'b-dec5', name: 'Highrise E', type: 'decorative', position: [30, 0, 10], scale: [4, 25, 4], rotation: [0, 0, 0], color: '#5f5049', interaction: { type: 'none' } },
  { id: 'b-dec6', name: 'Highrise F', type: 'decorative', position: [-30, 0, 5], scale: [5, 16, 5], rotation: [0, 0, 0], color: '#826b60', interaction: { type: 'none' } },
  { id: 'b-dec7', name: 'Lowrise G', type: 'decorative', position: [25, 0, 25], scale: [4, 12, 4], rotation: [0, 0, 0], color: '#6e5b53', interaction: { type: 'none' } },
  { id: 'b-dec8', name: 'Lowrise H', type: 'decorative', position: [-25, 0, 25], scale: [3, 14, 3], rotation: [0, 0, 0], color: '#8a7165', interaction: { type: 'none' } },
]
