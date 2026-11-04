"use client"

import { useEffect, useRef, useState } from "react"
import { getPublicAboutSection, getPublicSkillCategories } from "@/app/actions/public"
import { DEFAULT_SKILL_CATEGORIES, type SkillCategory } from "@/lib/skills"
import { Award, Code2, Layers, Cpu } from "lucide-react"


function AnimatedSkillCategory({ category }: { category: SkillCategory }) {
  const categoryRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = categoryRef.current
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0 })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={categoryRef} className="space-y-3">
      <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
        {category.name}
      </span>
      <div className="space-y-2.5">
        {category.skills.map((skill) => (
          <div key={skill.id} className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-neutral-800">
              <span>{skill.skill_name}</span>
              <span className="text-[#E31B23]">{skill.level}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E31B23] rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: visible ? `${skill.level}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AboutSection() {
  const [skillsData, setSkillsData] = useState<SkillCategory[]>(DEFAULT_SKILL_CATEGORIES)
  const [aboutContent, setAboutContent] = useState<{ title: string; content: string; image_url?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [about, skills] = await Promise.all([
          getPublicAboutSection().catch(() => null),
          getPublicSkillCategories().catch(() => null),
        ])

        if (about) {
          setAboutContent({
            title: about.title,
            content: about.content,
            image_url: about.image_url,
          })
        }

        if (skills !== null) {
          setSkillsData(skills.filter((category) => category.skills.length > 0))
        }
      } catch (err) {
        console.error("Error loading about/skills data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <section id="about" className="relative w-full py-20 px-4 sm:px-8 lg:px-14 bg-[#FAFAFC] border-t border-neutral-200/80">
      <div className="max-w-7xl mx-auto">
        {/* Top Tag */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E31B23]" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            About The Creator
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight uppercase mb-12">
          Afolabi Funmilade
        </h2>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Bio & Core Mission */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-neutral-200/80 shadow-sm space-y-6">
              <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                {aboutContent?.title || "Crafting Next-Generation Virtual Worlds"}
              </h3>

              {aboutContent?.content ? (
                <div
                  className="prose text-sm text-neutral-600 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: aboutContent.content }}
                />
              ) : (
                <div className="text-sm text-neutral-600 leading-relaxed space-y-4">
                  <p>
                    I am an XR &amp; Game Developer dedicated to building high-performance, immersive virtual experiences and interactive software. Specializing in Unity, C#, and spatial computing, my work bridges imagination and code.
                  </p>
                  <p>
                    From multiplayer VR escape rooms to enterprise mixed reality training and mobile applications, I focus on intuitive interactions, smooth frame rates, and unforgettable player presence.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#contact"
                  className="px-5 py-2.5 rounded-full bg-[#E31B23] text-white text-xs font-bold hover:bg-[#c9151c] transition-colors shadow-sm"
                >
                  Collaborate with Fumz
                </a>
                <a
                  href="/resume.pdf"
                  download="resume.pdf"
                  className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors"
                >
                  Download CV
                </a>
              </div>
            </div>

            {/* Quick Stat Pill */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 text-center">
                <span className="block text-2xl font-black text-[#E31B23]">5+</span>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase">Years Coding</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 text-center">
                <span className="block text-2xl font-black text-neutral-900">12+</span>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase">Projects Shipped</span>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 text-center">
                <span className="block text-2xl font-black text-neutral-900">99%</span>
                <span className="text-[11px] font-semibold text-neutral-500 uppercase">Client Satisfaction</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Technical Arsenal */}
          <div className="lg:col-span-7">
            <div className="p-8 bg-white rounded-3xl border border-neutral-200/80 shadow-sm">
              <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight mb-6">
                Technical Arsenal &amp; Capabilities
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skillsData.map((category) => (
                  <AnimatedSkillCategory key={category.id} category={category} />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
