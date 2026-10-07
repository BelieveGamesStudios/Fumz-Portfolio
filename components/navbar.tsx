"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, Sparkles } from "lucide-react"
import { useMousePosition } from "@/hooks/use-mouse-position"

export function Navbar() {
  useMousePosition()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Projects", href: "#projects" },
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Skills", href: "#skills" },
    { label: "Certifications", href: "#certifications" },
    { label: "Contact", href: "#contact" },
  ]

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    setIsOpen(false)

    // Dispatch global custom navigation event for CityScene
    const event = new CustomEvent("portfolio-navigate", {
      detail: { section: href },
    })
    window.dispatchEvent(event)

    // Update URL hash
    window.history.pushState(null, "", href)
  }

  return (
    <nav
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        isScrolled
          ? "glass shadow-lg shadow-black/20 border-b border-primary/25"
          : "bg-[#18191A]/72 backdrop-blur-xl border-b border-primary/15"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => {
              if (window.location.hash) {
                window.history.pushState(null, "", window.location.pathname)
                window.dispatchEvent(new Event("hashchange"))
              }
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary border border-accent/40 flex items-center justify-center text-primary-foreground font-mono font-bold text-sm shadow-[0_0_24px_rgba(168,92,58,0.25)] group-hover:scale-105 transition-transform">
              F
            </div>
            <span className="text-base sm:text-lg font-bold tracking-wider font-mono">
              FUMZ <span className="text-accent text-xs font-sans font-normal opacity-90">3D CITY</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group py-1 cursor-pointer"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-secondary/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1 animate-in fade-in slide-in-from-top-2 border-t border-border/40">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
