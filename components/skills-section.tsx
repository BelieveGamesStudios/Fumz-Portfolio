"use client"

import React, { useEffect, useState } from "react"
import { getPublicSkills } from "@/app/actions/public"
import { SkillSlider } from "@/components/skill-slider"
import { Sparkles, Code2, Layers, MonitorSmartphone, Wrench } from "lucide-react"

export interface Skill {
  id: string
  skill_name: string
  level: number
  category: string
}

export interface SkillCategory {
  name: string
  skills: Skill[]
}

export const DEFAULT_SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Game Development",
    skills: [
      { id: "1", skill_name: "Programming & Scripting", level: 90, category: "Game Development" },
      { id: "2", skill_name: "Game Design Principles", level: 85, category: "Game Development" },
      { id: "3", skill_name: "Asset Integration & Management", level: 80, category: "Game Development" },
      { id: "4", skill_name: "Debugging & Testing", level: 78, category: "Game Development" },
    ],
  },
  {
    name: "XR Development",
    skills: [
      { id: "5", skill_name: "Unity XR SDKs & Tools", level: 90, category: "XR Development" },
      { id: "6", skill_name: "3D Interaction & Input Handling", level: 85, category: "XR Development" },
      { id: "7", skill_name: "Spatial Computing", level: 80, category: "XR Development" },
      { id: "8", skill_name: "Performance & Latency Optimization", level: 78, category: "XR Development" },
    ],
  },
  {
    name: "Platforms",
    skills: [
      { id: "9", skill_name: "Windows / Mac / Linux", level: 88, category: "Platforms" },
      { id: "10", skill_name: "iOS", level: 85, category: "Platforms" },
      { id: "11", skill_name: "Android", level: 82, category: "Platforms" },
      { id: "12", skill_name: "XR Headsets (Meta Quest / Vision Pro)", level: 90, category: "Platforms" },
    ],
  },
  {
    name: "Tools",
    skills: [
      { id: "13", skill_name: "Unity Engine", level: 95, category: "Tools" },
      { id: "14", skill_name: "Blender 3D", level: 85, category: "Tools" },
      { id: "15", skill_name: "GIMP / Photoshop", level: 75, category: "Tools" },
      { id: "16", skill_name: "Audacity / Audio FX", level: 70, category: "Tools" },
    ],
  },
]

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Game Development": <Code2 className="w-5 h-5 text-accent" />,
  "XR Development": <Layers className="w-5 h-5 text-[#E1C1AF]" />,
  "Platforms": <MonitorSmartphone className="w-5 h-5 text-[#C57852]" />,
  "Tools": <Wrench className="w-5 h-5 text-[#D5A68C]" />,
}

interface SkillsSectionProps {
  isModal?: boolean
}

export function SkillsSection({ isModal = false }: SkillsSectionProps) {
  const [categories, setCategories] = useState<SkillCategory[]>(DEFAULT_SKILL_CATEGORIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getPublicSkills()
      .then((data) => {
        if (!isMounted) return
        if (data && data.length > 0) {
          // Group by category
          const grouped: Record<string, Skill[]> = {}
          data.forEach((s: any) => {
            const cat = s.category || "General"
            if (!grouped[cat]) grouped[cat] = []
            grouped[cat].push({
              id: s.id || s.skill_name,
              skill_name: s.skill_name,
              level: typeof s.level === "number" ? s.level : 80,
              category: cat,
            })
          })

          const mappedCategories = Object.keys(grouped).map((catName) => ({
            name: catName,
            skills: grouped[catName],
          }))
          setCategories(mappedCategories)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.warn("Failed to load public skills, using defaults", err)
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section
      id="skills"
      className={isModal ? "w-full py-1 px-1" : "relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-background"}
    >
      <div className={isModal ? "w-full space-y-6" : "max-w-6xl mx-auto space-y-12"}>
        {!isModal && (
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Technical Proficiency
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Skills & Capabilities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Specialized expertise in game development, spatial computing, cross-platform engineering, and digital tools.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`rounded-2xl bg-card/60 border border-border/80 backdrop-blur-md shadow-lg space-y-3.5 hover:border-primary/30 transition-colors ${
                isModal ? "p-4 sm:p-5" : "p-6"
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  {CATEGORY_ICONS[cat.name] || <Sparkles className="w-5 h-5 text-primary" />}
                  <h3 className="font-bold text-base sm:text-lg text-foreground tracking-wide">{cat.name}</h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {cat.skills.length} skills
                </span>
              </div>

              <div className="space-y-3.5 pt-1">
                {cat.skills.map((skill) => (
                  <div key={skill.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="font-medium text-foreground/90">{skill.skill_name}</span>
                      <span className="text-xs font-mono font-semibold text-primary">
                        {skill.level}%
                      </span>
                    </div>
                    <SkillSlider
                      value={skill.level}
                      ariaLabel={`${skill.skill_name} proficiency: ${skill.level}%`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
