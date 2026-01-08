"use client"

import { useEffect, useRef } from "react"

interface SkillCategory {
  name: string
  skills: string[]
}

const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: "Game Development",
    skills: ["Unity", "C#", "Physics", "Animation", "Shaders"],
  },
  {
    name: "XR Technologies",
    skills: ["VR Development", "AR/ARKit/ARCore", "MR Design", "Spatial Audio", "Hand Tracking"],
  },
  {
    name: "Platforms",
    skills: ["PC/Console", "Mobile (iOS/Android)", "Web", "VR Headsets", "HoloLens"],
  },
  {
    name: "Optimization",
    skills: ["Performance Tuning", "Memory Optimization", "Network Sync", "GPU Programming"],
  },
]

export function AboutSection() {
  const skillsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".skill-item").forEach((el, index) => {
              setTimeout(() => {
                el.classList.add("animate-in", "fade-in", "slide-in-from-bottom-2")
              }, index * 50)
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    if (skillsRef.current) {
      observer.observe(skillsRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* About Section */}
      <section
        id="about"
        className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background/95 to-background"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
              <div className="space-y-2">
                <h2 className="text-4xl sm:text-5xl font-bold">About Me</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>

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

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  href="#contact"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors text-center glow-effect"
                >
                  Get In Touch
                </a>
                <a
                  href="#"
                  className="px-6 py-3 glass rounded-xl font-medium hover:bg-secondary/50 transition-colors text-center"
                >
                  Download Resume
                </a>
              </div>
            </div>

            <div className="relative h-96 animate-in fade-in slide-in-from-right-4">
              <div className="absolute inset-0 glass rounded-3xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border border-primary/20 rounded-3xl rotate-45 absolute animate-pulse" />
                <div
                  className="w-48 h-48 border border-accent/20 rounded-3xl rotate-12 absolute animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
                <div
                  className="w-32 h-32 bg-gradient-to-br from-primary/30 to-accent/30 rounded-3xl animate-pulse glow-effect"
                  style={{ animationDelay: "1s" }}
                />
              </div>
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
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive toolkit built through hands-on experience across multiple platforms and technologies
            </p>
          </div>

          {/* Skills Grid */}
          <div ref={skillsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SKILL_CATEGORIES.map((category) => (
              <div
                key={category.name}
                className="p-6 glass rounded-2xl hover:glass transition-all duration-300 group glow-effect-hover"
              >
                <h3 className="text-lg font-bold mb-4 text-primary group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                <div className="space-y-3">
                  {category.skills.map((skill) => (
                    <div
                      key={skill}
                      className="skill-item flex items-center gap-3 opacity-0"
                      style={{
                        animationDuration: "0.5s",
                        animationFillMode: "forwards",
                      }}
                    >
                      <div className="w-2 h-2 bg-primary rounded-full group-hover:bg-accent transition-colors" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Additional info */}
          <div className="mt-16 p-8 glass rounded-2xl glow-effect">
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
