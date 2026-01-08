import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ProjectsSection } from "@/components/projects-section"
import { AboutSection } from "@/components/about-section"
import { ContactSection } from "@/components/contact-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { CertificationsSection } from "@/components/certifications-section"

export default function Home() {

  return (
    <main className="w-full">
      <ScrollAnimations />
      <Navbar />
      <HeroSection />
      <ProjectsSection />
      <AboutSection />
      <CertificationsSection />
      <ContactSection />
    </main>
  )
}
