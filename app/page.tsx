import { Navbar } from "@/components/navbar"
import { CityScene } from "@/components/city/CityScene"
// We will integrate these sections into the 3D city experience overlays later
import { HeroSection } from "@/components/hero-section"
import { ProjectsSection } from "@/components/projects-section"
import { AboutSection } from "@/components/about-section"
import { ExperienceSection } from "@/components/experience-section"
import { ContactSection } from "@/components/contact-section"
import { CertificationsSection } from "@/components/certifications-section"

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden relative">
      <Navbar />
      
      {/* 3D Miniature City */}
      <CityScene />
    </main>
  )
}
