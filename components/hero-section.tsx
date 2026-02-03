"use client"

import { Button } from "@/components/ui/button"
import DarkVeil from "./dark-veil"

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-60">
        <DarkVeil speed={0.4} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" data-parallax="0.08" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" data-parallax="-0.06" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="space-y-6" data-scroll-animate data-animation="slide-up">
          <div className="inline-block">
            <span className="px-4 py-2 rounded-full glass text-foreground text-sm font-medium">
              Welcome to My Portfolio
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-balance">
            Building{" "}
            <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-gradient-text">
              Immersive Digital Experiences
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            VR/AR/MR applications and interactive digital experiences that push the boundaries of technology
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="glass text-foreground hover:glass-sm group" asChild>
              <a href="#projects">
                View Projects
                <span className="group-hover:translate-x-1 transition-transform ml-2">→</span>
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass hover:bg-secondary/50 border-border/50 bg-transparent"
              asChild
            >
              <a href="#contact">Get In Touch</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
