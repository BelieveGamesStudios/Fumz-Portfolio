"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowUpRight, Gamepad2, Smartphone, Cpu, LucideGlasses } from "lucide-react"
import Link from "next/link"
import { stripHtml } from "@/lib/utils"

type ProjectCategory = "all" | "games" | "xr" | "mobile" | "desktop"

interface Project {
  id: string
  title: string
  description: string
  category: Exclude<ProjectCategory, "all">
  image: string
  platforms: string[]
  link: string
}

// Fallback sample data if no projects are found in database
const SAMPLE_PROJECTS: Project[] = [
  {
    id: "1",
    title: "VR Escape Room Experience",
    description: "Fully immersive VR escape room with dynamic puzzle mechanics and multiplayer support",
    category: "xr",
    image: "/vr-escape-room-immersive-experience.jpg",
    platforms: ["VR", "Unity"],
    link: "/projects/vr-escape-room",
  },
  {
    id: "2",
    title: "AR Museum Guide",
    description: "Interactive AR application for museum navigation with 3D model visualization and history content",
    category: "xr",
    image: "/augmented-reality-museum-guide.jpg",
    platforms: ["AR", "ARKit", "ARCore"],
    link: "/projects/ar-museum",
  },
  {
    id: "3",
    title: "Space Odyssey - Game",
    description: "3D space exploration game with procedurally generated planets and realistic physics",
    category: "games",
    image: "/3d-space-game-planets-exploration.jpg",
    platforms: ["PC", "Console", "Web"],
    link: "/projects/space-odyssey",
  },
  {
    id: "4",
    title: "FitTrack Mobile App",
    description: "Cross-platform fitness tracking app with AI-powered workout recommendations",
    category: "mobile",
    image: "/fitness-tracking-app-mobile.jpg",
    platforms: ["iOS", "Android"],
    link: "/projects/fittrack",
  },
  {
    id: "5",
    title: "Metaverse Chat Platform",
    description: "Real-time avatar-based communication platform with spatial audio and VR support",
    category: "xr",
    image: "/metaverse-avatar-chat-vr.jpg",
    platforms: ["VR", "PC", "Mobile"],
    link: "/projects/metaverse-chat",
  },
  {
    id: "6",
    title: "AI Content Creator Suite",
    description: "Desktop application for procedural content generation with machine learning optimization",
    category: "desktop",
    image: "/ai-content-creation-desktop-software.jpg",
    platforms: ["Windows", "macOS"],
    link: "/projects/ai-creator-suite",
  },
  {
    id: "7",
    title: "MR Industrial Training",
    description: "Mixed reality training simulator for industrial equipment maintenance and safety",
    category: "xr",
    image: "/mixed-reality-industrial-training-vr.jpg",
    platforms: ["HoloLens", "Quest"],
    link: "/projects/mr-training",
  },
  {
    id: "8",
    title: "Rhythm Master",
    description: "Rhythm game with custom song support and global leaderboards",
    category: "games",
    image: "/rhythm-music-game-leaderboard.jpg",
    platforms: ["PC", "Mobile"],
    link: "/projects/rhythm-master",
  },
]

const CATEGORIES: { label: string; value: ProjectCategory; icon: React.ReactNode }[] = [
  { label: "All", value: "all", icon: null },
  { label: "Games", value: "games", icon: <Gamepad2 className="w-4 h-4" /> },
  { label: "XR Apps", value: "xr", icon: <LucideGlasses className="w-4 h-4" /> },
  { label: "Mobile", value: "mobile", icon: <Smartphone className="w-4 h-4" /> },
  { label: "Desktop", value: "desktop", icon: <Cpu className="w-4 h-4" /> },
]

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects')
        const data = await response.json()

        // If no projects from database, use sample data
        setProjects(data.length > 0 ? data : SAMPLE_PROJECTS)
      } catch (error) {
        console.error('Error fetching projects:', error)
        // Fallback to sample data on error
        setProjects(SAMPLE_PROJECTS)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <section id="projects" className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-16 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold">Featured Projects</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore my work across games, XR experiences, mobile apps, and desktop applications
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {CATEGORIES.map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeCategory === category.value
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 glow-effect"
                  : "glass text-muted-foreground hover:bg-secondary/50 border-border/50"
                }`}
              aria-pressed={activeCategory === category.value}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : (
            (() => {
              const filteredProjects = activeCategory === "all"
                ? projects
                : projects.filter((project) => project.category === activeCategory)

              return filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <Link
                    key={project.id}
                    href={project.link}
                    className="group relative overflow-hidden rounded-2xl glass-sm hover:glass transition-all duration-300 glow-effect-hover"
                    data-scroll-animate
                    data-animation="slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Project image */}
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                      <img
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{stripHtml(project.description)}</p>

                      {/* Platform tags */}
                      <div className="flex flex-wrap gap-2">
                        {project.platforms.map((platform) => (
                          <span key={platform} className="px-2 py-1 glass-sm text-primary text-xs rounded-md">
                            {platform}
                          </span>
                        ))}
                      </div>

                      {/* View project link */}
                      <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all duration-300 pt-2">
                        View Project
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No projects found in this category.</p>
                </div>
              )
            })()
          )}
        </div>
      </div>
    </section>
  )
}
