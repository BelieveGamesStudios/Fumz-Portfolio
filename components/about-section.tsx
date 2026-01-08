"use client"

import { useEffect, useRef, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { SkillSlider } from "@/components/skill-slider"

interface Skill {
  id: string
  skill_name: string
  level: number
  category: string
}

interface SkillCategory {
  name: string
  skills: Skill[]
}

// Default skills - will be replaced by database values
const DEFAULT_SKILLS: SkillCategory[] = [
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
      { id: "9", skill_name: "Windows/Mac/Linux", level: 88, category: "Platforms" },
      { id: "10", skill_name: "iOS", level: 85, category: "Platforms" },
      { id: "11", skill_name: "Android", level: 82, category: "Platforms" },
      { id: "12", skill_name: "XR Headsets", level: 90, category: "Platforms" },
    ],
  },
  {
    name: "Tools",
    skills: [
      { id: "13", skill_name: "Unity Engine", level: 95, category: "Tools" },
      { id: "14", skill_name: "Blender", level: 85, category: "Tools" },
      { id: "15", skill_name: "GIMP", level: 75, category: "Tools" },
      { id: "16", skill_name: "Audacity", level: 70, category: "Tools" },
    ],
  },
]

// Predefined skill lists (used to ensure consistent ordering and presence on the homepage)
const PREDEFINED_SKILLS: Record<string, string[]> = {
  'Game Development': [
    'Programming & Scripting',
    'Game Design Principles',
    'Asset Integration & Management',
    'Debugging & Testing',
  ],
  'XR Development': [
    'Unity XR SDKs & Tools',
    '3D Interaction & Input Handling',
    'Spatial Computing',
    'Performance & Latency Optimization',
  ],
  'Platforms': [
    'Windows/Mac/Linux',
    'iOS',
    'Android',
    'XR Headsets',
  ],
  'Tools': [
    'Unity Engine',
    'Blender',
    'GIMP',
    'Audacity',
  ],
}

import { getPublicAboutSection, getPublicSkills } from "@/app/actions/public"

// ... (existing imports)

export function AboutSection() {
  const skillsRef = useRef<HTMLDivElement>(null)
  const [skillsData, setSkillsData] = useState<SkillCategory[]>(DEFAULT_SKILLS)
  const [aboutContent, setAboutContent] = useState<{ title: string; content: string; image_url?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [animatedSkills, setAnimatedSkills] = useState<Set<string>>(new Set())
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Fetch about section content
    fetchAboutContent()
    // Fetch skills from database
    fetchSkills()

    // Periodically refresh skills to stay in sync with admin changes
    fetchIntervalRef.current = setInterval(() => {
      fetchSkills()
      fetchAboutContent()
    }, 5000) // Refresh every 5 seconds

    return () => {
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current)
    }
  }, [])

  async function fetchAboutContent() {
    try {
      const data = await getPublicAboutSection()
      if (data) {
        setAboutContent({
          title: data.title,
          content: data.content,
          image_url: data.image_url,
        })
      }
    } catch (error) {
      console.error('Error fetching about content:', error)
    }
  }

  async function fetchSkills() {
    try {
      // Use the public server action instead of the API route
      const skills = await getPublicSkills()

      if (skills && skills.length > 0) {
        // Build categories from the predefined list so homepage always shows the same sections
        const categories = Object.keys(PREDEFINED_SKILLS).map((category) => {
          const skillsForCategory = PREDEFINED_SKILLS[category].map((skillName, idx) => {
            const dbSkill = skills.find((s) => s.skill_name === skillName && s.category === category)
            const defaultLevel = DEFAULT_SKILLS.find((d) => d.name === category)?.skills.find((s) => s.skill_name === skillName)?.level ?? 50

            return {
              id: dbSkill?.id ?? `default-${category}-${idx}`,
              skill_name: skillName,
              level: dbSkill ? dbSkill.level : defaultLevel,
              category,
            }
          })

          return { name: category, skills: skillsForCategory }
        })

        setSkillsData(categories.length > 0 ? categories : DEFAULT_SKILLS)
      } else {
        // Fallback to defaults
        setSkillsData(DEFAULT_SKILLS)
      }
    } catch (error) {
      console.log('Using default skills', error)
      setSkillsData(DEFAULT_SKILLS)
    } finally {
      setLoading(false)
    }
  }

  // ... (fetchSkills and IntersectionObserver remain unchanged)

  return (
    <>
      <section
        id="about"
        className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background/95 to-background"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6" data-scroll-animate data-animation="slide-left">
              <div className="space-y-2">
                <h2 className="text-4xl sm:text-5xl font-bold">{aboutContent?.title || 'About Me'}</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>

              {aboutContent?.content ? (
                <div className="prose prose-invert max-w-none text-lg text-muted-foreground leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: aboutContent.content }} />
                </div>
              ) : (
                <>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    I'm a passionate Unity and XR developer with a deep commitment to creating immersive, interactive
                    experiences that push the boundaries of technology. My work spans game development, virtual reality,
                    augmented reality, and mixed reality applications.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    With years of experience building high-performance applications across multiple platforms, I specialize
                    in optimizing complex systems and bringing creative visions to life through code. I'm particularly drawn
                    to projects that combine technical excellence with innovative design.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Whether it's architecting scalable multiplayer systems, implementing advanced visual effects, or
                    designing intuitive spatial interfaces, I'm always looking to solve challenging problems and create
                    experiences that resonate with users.
                  </p>
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  href="#contact"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors text-center glow-effect"
                >
                  Get In Touch
                </a>
                <a
                  href="/resume.pdf"
                  download="resume.pdf"
                  className="px-6 py-3 glass rounded-xl font-medium hover:bg-secondary/50 transition-colors text-center"
                >
                  Download Resume
                </a>
              </div>
            </div>

            <div className="relative h-96 w-full flex items-center justify-center" data-scroll-animate data-animation="slide-right">
              {aboutContent?.image_url ? (
                <div className="relative w-full h-full max-w-md mx-auto aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl transform -rotate-6 scale-95" />
                  <div className="relative h-full w-full glass rounded-3xl overflow-hidden shadow-2xl reveal-card reveal-border">
                    <img
                      src={aboutContent.image_url}
                      alt={aboutContent.title || "About Me"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 glass rounded-3xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border border-primary/20 rounded-3xl rotate-45 absolute" data-parallax="0.04" />
                    <div
                      className="w-48 h-48 border border-accent/20 rounded-3xl rotate-12 absolute"
                      style={{ animationDelay: "0.5s" }}
                      data-parallax="-0.03"
                    />
                    <div
                      className="w-32 h-32 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl glow-effect"
                      style={{ animationDelay: "1s" }}
                      data-parallax="0.06"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="space-y-4 mb-16 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold">Technical Skills</h2>
            <div className="flex justify-center mt-3">
              <div className="fluoro-underline" aria-hidden="true" />
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
              A comprehensive toolkit built through hands-on experience across multiple platforms and technologies
            </p>
          </div>

          {/* Skills Grid */}
          <div ref={skillsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skillsData.map((category) => (
              <div
                key={category.name}
                className="p-6 glass rounded-2xl transition-all duration-300 reveal-card reveal-border"
                data-scroll-animate
                data-animation="slide-up"
              >
                <h3 className="text-lg font-bold mb-4 text-primary transition-colors">
                  {category.name}
                </h3>
                <div className="space-y-4">
                  {category.skills.map((skill) => (
                    <div key={skill.id} className="skill-item" data-skill={skill.skill_name}>
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-muted-foreground transition-colors">
                          {skill.skill_name}
                        </span>
                      </div>

                      {/* Skill Slider (read-only for visitors) */}
                      <div className="mt-2">
                        <SkillSlider
                          value={skill.level}
                          className="w-full"
                          ariaLabel={`${skill.skill_name} proficiency`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Additional info */}
          <div className="mt-16 p-8 glass rounded-2xl glow-effect reveal-card reveal-border">
            <h3 className="text-xl font-bold mb-4">Additional Expertise</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold text-primary mb-2">Performance Optimization</h4>
                <p className="text-muted-foreground text-sm">
                  Specialized in reducing CPU/GPU load, memory optimization, and achieving high FPS across platforms
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">System Architecture</h4>
                <p className="text-muted-foreground text-sm">
                  Designing scalable, maintainable systems for large multiplayer projects and complex interactions
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">UI/UX Design</h4>
                <p className="text-muted-foreground text-sm">
                  Creating intuitive interfaces for both traditional and spatial/VR environments
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
