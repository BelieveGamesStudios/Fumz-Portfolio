export interface SkillItem {
  id: string
  skill_name: string
  level: number
}

export interface SkillCategory {
  id: string
  name: string
  skills: SkillItem[]
}

export function validateSkillCategories(input: unknown): SkillCategory[] {
  if (!Array.isArray(input)) throw new Error('Categories must be a list.')
  const categoryNames = new Set<string>()
  const ids = new Set<string>()
  function text(value: unknown, label: string) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required.`)
    return value.trim()
  }
  function id(value: unknown) {
    const result = text(value, 'Item ID')
    if (ids.has(result)) throw new Error('Each category and skill must have a unique ID.')
    ids.add(result)
    return result
  }
  return input.map((category) => {
    if (!category || typeof category !== 'object') throw new Error('Invalid category.')
    const name = text(category.name, 'Category name')
    if (categoryNames.has(name.toLowerCase())) throw new Error(`Duplicate category name: ${name}.`)
    categoryNames.add(name.toLowerCase())
    if (!Array.isArray(category.skills)) throw new Error(`Skills in ${name} must be a list.`)
    const categoryId = id(category.id)
    const skillNames = new Set<string>()
    const skills = category.skills.map((skill: unknown) => {
      if (!skill || typeof skill !== 'object' || !('skill_name' in skill) || !('level' in skill) || !('id' in skill)) {
        throw new Error(`Invalid skill in ${name}.`)
      }
      const skillName = text(skill.skill_name, 'Skill name')
      if (skillNames.has(skillName.toLowerCase())) throw new Error(`Duplicate skill in ${name}: ${skillName}.`)
      skillNames.add(skillName.toLowerCase())
      if (typeof skill.level !== 'number' || !Number.isInteger(skill.level) || skill.level < 0 || skill.level > 100) {
        throw new Error(`The level for ${skillName} must be a whole number from 0 to 100.`)
      }
      return { id: id(skill.id), skill_name: skillName, level: skill.level }
    })
    return { id: categoryId, name, skills }
  })
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const destination = index + direction
  if (index < 0 || index >= items.length || destination < 0 || destination >= items.length) return items
  const result = [...items]
  ;[result[index], result[destination]] = [result[destination], result[index]]
  return result
}

export const DEFAULT_SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Game Development",
    skills: [
      { id: "1", skill_name: "Programming & Scripting (C#)", level: 92 },
      { id: "2", skill_name: "Game Architecture & Design", level: 88 },
      { id: "3", skill_name: "Asset Pipeline & Physics", level: 85 },
      { id: "4", skill_name: "Optimization & Profiling", level: 82 },
    ],
  },
  {
    name: "XR Development",
    skills: [
      { id: "5", skill_name: "Unity XR Interaction Toolkit", level: 94 },
      { id: "6", skill_name: "Spatial Computing & Audio", level: 88 },
      { id: "7", skill_name: "AR Foundation (ARKit / ARCore)", level: 85 },
      { id: "8", skill_name: "Headset Latency Optimization", level: 80 },
    ],
  },
  {
    name: "Platforms & Hardware",
    skills: [
      { id: "9", skill_name: "Meta Quest 2 & 3 / Pro", level: 92 },
      { id: "10", skill_name: "Apple Vision Pro & iOS", level: 84 },
      { id: "11", skill_name: "PCVR & SteamVR", level: 88 },
      { id: "12", skill_name: "Cross-Platform Android", level: 82 },
    ],
  },
  {
    name: "Tools & Ecosystem",
    skills: [
      { id: "13", skill_name: "Unity Engine 6 / LTS", level: 95 },
      { id: "14", skill_name: "Blender 3D Modeling", level: 80 },
      { id: "15", skill_name: "Git / Perforce Version Control", level: 88 },
      { id: "16", skill_name: "Shader Graph & VFX Graph", level: 78 },
    ],
  },
].map((category, index) => ({ ...category, id: `default-category-${index}` }))
