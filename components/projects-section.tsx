"use client"

import React, { useState, useEffect } from "react"
import { ArrowUpRight, Smartphone, Cpu, LucideGlasses, Layers } from "lucide-react"
import Link from "next/link"
import { stripHtml } from "@/lib/utils"

type ProjectCategory = "all" | "xr" | "mobile" | "desktop"

interface Project {
  id: string
  title: string
  description: string
  category: Exclude<ProjectCategory, "all">
  image: string
  platforms: string[]
  link: string
}

const SAMPLE_PROJECTS: Project[] = [
  {
    id: "1",
    title: "VR Escape Room Experience",
    description: "Fully immersive VR escape room with dynamic puzzle mechanics and multiplayer support.",
    category: "xr",
    image: "/vr-escape-room-immersive-experience.jpg",
    platforms: ["VR", "Unity", "Quest 3"],
    link: "/projects/vr-escape-room",
  },
  {
    id: "2",
    title: "AR Museum Guide",
    description: "Interactive AR application for museum navigation with 3D model visualization and history content.",
    category: "xr",
    image: "/augmented-reality-museum-guide.jpg",
    platforms: ["AR", "ARKit", "ARCore"],
    link: "/projects/ar-museum",
  },
  {
    id: "4",
    title: "FitTrack Mobile App",
    description: "Cross-platform fitness tracking app with AI-powered workout recommendations.",
    category: "mobile",
    image: "/fitness-tracking-app-mobile.jpg",
    platforms: ["iOS", "Android"],
    link: "/projects/fittrack",
  },
  {
    id: "5",
    title: "Metaverse Chat Platform",
    description: "Real-time avatar-based communication platform with spatial audio and VR support.",
    category: "xr",
    image: "/metaverse-avatar-chat-vr.jpg",
    platforms: ["VR", "PC", "Spatial"],
    link: "/projects/metaverse-chat",
  },
  {
    id: "6",
    title: "AI Content Creator Suite",
    description: "Desktop application for procedural content generation with machine learning optimization.",
    category: "desktop",
    image: "/ai-content-creation-desktop-software.jpg",
    platforms: ["Windows", "macOS"],
    link: "/projects/ai-creator-suite",
  },
  {
    id: "7",
    title: "MR Industrial Training",
    description: "Mixed reality training simulator for industrial equipment maintenance and safety.",
    category: "xr",
    image: "/mixed-reality-industrial-training-vr.jpg",
    platforms: ["HoloLens", "Quest", "MR"],
    link: "/projects/mr-training",
  },
]

const CATEGORIES: { label: string; value: ProjectCategory; icon: React.ReactNode }[] = [
  { label: "All Works", value: "all", icon: <Layers className="w-3.5 h-3.5" /> },
  { label: "XR & VR", value: "xr", icon: <LucideGlasses className="w-3.5 h-3.5" /> },
  { label: "Mobile Apps", value: "mobile", icon: <Smartphone className="w-3.5 h-3.5" /> },
  { label: "Desktop & Tools", value: "desktop", icon: <Cpu className="w-3.5 h-3.5" /> },
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
        setProjects(data.length > 0 ? data : SAMPLE_PROJECTS)
      } catch (error) {
        console.error('Error fetching projects:', error)
        setProjects(SAMPLE_PROJECTS)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((project) => project.category === activeCategory)

  return (
    <section id="projects" className="relative w-full py-20 px-4 sm:px-8 lg:px-14 bg-white border-t border-neutral-200/80">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E31B23]" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Selected Portfolio
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight uppercase">
              Featured Works
            </h2>
          </div>

          {/* Filter Pill Buttons */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                  activeCategory === category.value
                    ? "bg-[#E31B23] text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-neutral-500 text-sm">Loading projects...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={project.link}
                className="group flex flex-col bg-[#FAFAFC] rounded-2xl overflow-hidden border border-neutral-200/80 hover:border-neutral-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-56 sm:h-64 overflow-hidden bg-neutral-100">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-800 shadow-sm group-hover:bg-[#E31B23] group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Platform Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="px-2 py-0.5 rounded-md bg-neutral-200/70 text-neutral-800 text-[11px] font-semibold"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-[#E31B23] transition-colors mb-2">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                      {stripHtml(project.description)}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-200/60 flex items-center justify-between text-xs font-bold text-[#E31B23]">
                    <span>Explore Project</span>
                    <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-neutral-500">No projects found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
