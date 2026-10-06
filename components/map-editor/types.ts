export type BuildingType = 'portfolio' | 'decorative' | 'glb'

export interface PlacedBuilding {
  id: string
  name: string
  type: BuildingType
  glb_url?: string
  position: [number, number, number]
  rotation: [number, number, number] // in radians [x, y, z]
  scale: [number, number, number]
  color?: string
  label?: string
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
  created_at?: string
}

export const DEFAULT_BUILDINGS: PlacedBuilding[] = [
  // Core Portfolio Buildings
  { id: 'b-cert', name: 'Certifications Tower', type: 'portfolio', label: 'CERTIFICATIONS', color: '#eb4034', position: [0, 0, -15], scale: [6, 12, 6], rotation: [0, 0, 0] },
  { id: 'b-edu', name: 'Education Building', type: 'portfolio', label: 'EDUCATION', color: '#3492eb', position: [0, 0, -25], scale: [5, 10, 5], rotation: [0, 0, 0] },
  { id: 'b-exp', name: 'Experience Hub', type: 'portfolio', label: 'EXPERIENCE', color: '#34eb74', position: [15, 0, 0], scale: [8, 15, 8], rotation: [0, 0, 0] },
  { id: 'b-abt', name: 'About Pavilion', type: 'portfolio', label: 'ABOUT', color: '#ebb434', position: [-15, 0, 0], scale: [7, 8, 7], rotation: [0, 0, 0] },
  { id: 'b-prj', name: 'Projects Complex', type: 'portfolio', label: 'PROJECTS', color: '#9334eb', position: [0, 0, 15], scale: [8, 14, 8], rotation: [0, 0, 0] },
  { id: 'b-soc', name: 'Socials Station', type: 'portfolio', label: 'SOCIALS', color: '#34ebd3', position: [15, 0, 15], scale: [5, 6, 5], rotation: [0, 0, 0] },
  { id: 'b-skl', name: 'Skills Spire', type: 'portfolio', label: 'SKILLS', color: '#eb3483', position: [-15, 0, 15], scale: [6, 9, 6], rotation: [0, 0, 0] },
  { id: 'b-cnt', name: 'Contact Kiosk', type: 'portfolio', label: 'CONTACT', color: '#a8325a', position: [0, 0, 25], scale: [6, 7, 6], rotation: [0, 0, 0] },

  // Decorative Buildings (Skyline Context)
  { id: 'b-dec1', name: 'Tower A', type: 'decorative', position: [25, 0, -20], scale: [4, 18, 4], rotation: [0, 0, 0], color: '#718096' },
  { id: 'b-dec2', name: 'Tower B', type: 'decorative', position: [-25, 0, -15], scale: [5, 22, 5], rotation: [0, 0, 0], color: '#718096' },
  { id: 'b-dec3', name: 'Block C', type: 'decorative', position: [20, 0, -30], scale: [3, 10, 3], rotation: [0, 0, 0], color: '#718096' },
  { id: 'b-dec4', name: 'Block D', type: 'decorative', position: [-20, 0, -25], scale: [6, 15, 6], rotation: [0, 0, 0], color: '#718096' },
  { id: 'b-dec5', name: 'Highrise E', type: 'decorative', position: [30, 0, 10], scale: [4, 25, 4], rotation: [0, 0, 0], color: '#718096' },
  { id: 'b-dec6', name: 'Highrise F', type: 'decorative', position: [-30, 0, 5], scale: [5, 16, 5], rotation: [0, 0, 0], color: '#718096' },
  { id: 'b-dec7', name: 'Lowrise G', type: 'decorative', position: [25, 0, 25], scale: [4, 12, 4], rotation: [0, 0, 0], color: '#718096' },
  { id: 'b-dec8', name: 'Lowrise H', type: 'decorative', position: [-25, 0, 25], scale: [3, 14, 3], rotation: [0, 0, 0], color: '#718096' },
]
