"use client"

import React, { useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  X,
  ExternalLink,
  Briefcase,
  Layers,
  Award,
  Mail,
  User,
  FolderGit2,
  Sparkles,
} from "lucide-react"
import {
  PlacedBuilding,
  BuildingModalConfig,
  normalizeBuildingInteraction,
  isValidSafeUrl,
} from "@/components/map-editor/types"

// Sections
import { ProjectsSection } from "@/components/projects-section"
import { AboutSection } from "@/components/about-section"
import { ExperienceSection } from "@/components/experience-section"
import { SkillsSection } from "@/components/skills-section"
import { CertificationsSection } from "@/components/certifications-section"
import { ContactSection } from "@/components/contact-section"

interface BuildingModalOverlayProps {
  building: PlacedBuilding | null
  isOpen: boolean
  onClose: () => void
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string; icon: React.ReactNode }> = {
  projects: {
    title: "Projects & Applications",
    subtitle: "Interactive portfolio of VR, AR, games, and web applications",
    icon: <FolderGit2 className="w-5 h-5 text-accent" />,
  },
  about: {
    title: "About & Biography",
    subtitle: "Background, philosophy, and creative direction",
    icon: <User className="w-5 h-5 text-[#D5A68C]" />,
  },
  experience: {
    title: "Work Experience & History",
    subtitle: "Professional trajectory and key contributions",
    icon: <Briefcase className="w-5 h-5 text-[#C57852]" />,
  },
  skills: {
    title: "Skills & Technical Spire",
    subtitle: "Engine proficiency, SDK mastery, and technical abilities",
    icon: <Layers className="w-5 h-5 text-[#E1C1AF]" />,
  },
  certifications: {
    title: "Certifications & Credentials",
    subtitle: "Verified industry credentials and specializations",
    icon: <Award className="w-5 h-5 text-[#B96843]" />,
  },
  contact: {
    title: "Contact & Collaboration Hub",
    subtitle: "Get in touch for projects, consulting, or enquiries",
    icon: <Mail className="w-5 h-5 text-[#D99A77]" />,
  },
}

/**
 * Safe markdown parser that converts markdown-like text to sanitized React elements
 * without dangerouslySetInnerHTML to prevent XSS.
 */
function SafeMarkdownViewer({ content }: { content: string }) {
  if (!content) return null

  // Split lines
  const lines = content.split(/\r?\n/)
  const elements: React.ReactNode[] = []

  let inList = false
  let listItems: React.ReactNode[] = []

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2 text-muted-foreground">
          {listItems}
        </ul>
      )
      listItems = []
      inList = false
    }
  }

  const renderInlineFormatted = (text: string): React.ReactNode => {
    // Bold: **text**
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic text-foreground/90">{part.slice(1, -1)}</em>
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-secondary text-accent font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        )
      }
      return part
    })
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      return
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      flushList()
      elements.push(
        <h4 key={index} className="text-base font-bold text-foreground mt-4 mb-2">
          {renderInlineFormatted(trimmed.slice(4))}
        </h4>
      )
    } else if (trimmed.startsWith("## ")) {
      flushList()
      elements.push(
        <h3 key={index} className="text-lg font-bold text-foreground mt-5 mb-2">
          {renderInlineFormatted(trimmed.slice(3))}
        </h3>
      )
    } else if (trimmed.startsWith("# ")) {
      flushList()
      elements.push(
        <h2 key={index} className="text-xl font-bold text-foreground mt-6 mb-3 border-b border-border/40 pb-1">
          {renderInlineFormatted(trimmed.slice(2))}
        </h2>
      )
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      // List item
      inList = true
      listItems.push(
        <li key={`li-${index}`} className="text-sm text-muted-foreground leading-relaxed">
          {renderInlineFormatted(trimmed.slice(2))}
        </li>
      )
    } else {
      flushList()
      elements.push(
        <p key={index} className="text-sm text-muted-foreground leading-relaxed my-2">
          {renderInlineFormatted(trimmed)}
        </p>
      )
    }
  })

  flushList()

  return <div className="space-y-1">{elements}</div>
}

export function BuildingModalOverlay({ building, isOpen, onClose }: BuildingModalOverlayProps) {
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement
    } else if (triggerRef.current) {
      // Restore focus
      triggerRef.current.focus?.()
      triggerRef.current = null
    }
  }, [isOpen])

  if (!building) return null

  const interaction: BuildingModalConfig = normalizeBuildingInteraction(building)
  const isCustom = interaction.type === "custom"
  const isSection = interaction.type !== "none" && !isCustom

  const meta = isSection ? SECTION_TITLES[interaction.type] : null
  const displayTitle = isCustom
    ? interaction.customTitle || building.name
    : meta?.title || building.name
  const displaySubtitle = isCustom
    ? interaction.customSubtitle || building.label || "Interactive Location"
    : meta?.subtitle || building.label || ""

  const safeLink = isCustom && interaction.customLink && isValidSafeUrl(interaction.customLink)
    ? interaction.customLink
    : null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[88vh] md:max-h-[85vh] p-0 gap-0 overflow-hidden bg-[#18191A]/96 border border-primary/35 text-foreground backdrop-blur-2xl shadow-[0_24px_90px_rgba(0,0,0,0.55)] rounded-2xl flex flex-col focus:outline-none"
        aria-describedby="building-modal-description"
      >
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 border-b border-border/60 bg-gradient-to-r from-card/80 via-card/40 to-card/80 flex flex-row items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3 sm:gap-4 pr-10 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              {meta?.icon || <Sparkles className="w-5 h-5 text-primary" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg sm:text-2xl font-bold tracking-tight text-foreground font-sans truncate">
                  {displayTitle}
                </DialogTitle>
                {building.label && (
                  <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider text-primary border-primary/30 shrink-0 hidden sm:inline-flex">
                    {building.label}
                  </Badge>
                )}
              </div>
              <DialogDescription id="building-modal-description" className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
                {displaySubtitle}
              </DialogDescription>
            </div>
          </div>

          {/* Single, Sleek Close Button */}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-primary/15 shrink-0 cursor-pointer absolute top-4 right-4 sm:top-5 sm:right-5 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 overscroll-contain">
          {/* Section Rendering */}
          {interaction.type === "projects" && <ProjectsSection isModal={true} />}
          {interaction.type === "about" && <AboutSection isModal={true} />}
          {interaction.type === "experience" && <ExperienceSection isModal={true} />}
          {interaction.type === "skills" && <SkillsSection isModal={true} />}
          {interaction.type === "certifications" && <CertificationsSection isModal={true} />}
          {interaction.type === "contact" && <ContactSection isModal={true} />}

          {/* Custom Building Content */}
          {isCustom && (
            <div className="space-y-6">
              {interaction.customContent ? (
                <div className="p-6 rounded-2xl bg-card/40 border border-border/50 backdrop-blur-md">
                  <SafeMarkdownViewer content={interaction.customContent} />
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground bg-card/20 rounded-2xl border border-dashed border-border/60">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50 text-primary" />
                  <p className="text-sm font-medium">Custom Building Information</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No custom description added yet. Configure it in the Map Editor Inspector.
                  </p>
                </div>
              )}

              {/* Action Link Button */}
              {safeLink && (
                <div className="pt-2 flex justify-end">
                  <a
                    href={safeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all glow-effect shadow-lg"
                  >
                    <span>{interaction.customLinkLabel || "Explore Link"}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
