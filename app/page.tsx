import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ProjectsSection } from "@/components/projects-section"
import { AboutSection } from "@/components/about-section"
import { ExperienceSection } from "@/components/experience-section"
import { ContactSection } from "@/components/contact-section"
import { ScrollAnimations } from "@/components/scroll-animations"
import { CertificationsSection } from "@/components/certifications-section"
import type { Metadata } from "next"
import { fullName, siteDescription, siteUrl } from "@/lib/seo"

export const metadata: Metadata = {
  ...(siteUrl ? { alternates: { canonical: siteUrl } } : {}),
}

const profile = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  ...(siteUrl ? { "@id": `${siteUrl}/#profile`, url: siteUrl } : {}),
  name: `${fullName} (Fumz) — Portfolio`,
  description: siteDescription,
  mainEntity: {
    "@type": "Person",
    ...(siteUrl ? {
      "@id": `${siteUrl}/#person`,
      url: siteUrl,
      image: `${siteUrl}/Fumz%20Transparent.png`,
    } : {}),
    name: fullName,
    alternateName: ["Afolabi Funmilade", "Fumz"],
    jobTitle: "XR & Game Developer",
    description: siteDescription,
    knowsAbout: ["Game development", "Extended reality", "Unity", "C#", "3D applications"],
    sameAs: [
      "https://github.com/believegamesstudios",
      "https://www.linkedin.com/in/believe-studios",
    ],
  },
}

export default function Home() {

  return (
    <main className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profile).replace(/</g, "\\u003c") }}
      />
      <ScrollAnimations />
      <Navbar />
      <HeroSection />
      <ProjectsSection />
      <AboutSection />
      <ExperienceSection />
      <CertificationsSection />
      <ContactSection />
    </main>
  )
}
