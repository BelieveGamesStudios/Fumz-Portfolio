"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, Github, Linkedin, Twitter, Mail } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "Projects", href: "#projects" },
    { label: "About", href: "#about" },
    { label: "Collaboration", href: "#contact" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-sm translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14">
        <div className="flex justify-between items-center h-16">
          {/* Logo Badge */}
          <Link href="#" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white border border-neutral-200/90 shadow-sm flex items-center justify-center p-0.5 group-hover:border-[#E31B23] transition-colors">
              <img
                src="/apple-icon.png"
                alt="App Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight uppercase text-neutral-900">
                Believe Studios
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">
                Afolabi Funmilade
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-neutral-700">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group flex items-center gap-2 hover:text-[#E31B23] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full border border-neutral-400 group-hover:border-[#E31B23] group-hover:bg-[#E31B23] transition-colors" />
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          {/* Actions & Socials */}
          <div className="hidden md:flex items-center gap-4 text-neutral-700">
            <a
              href="https://github.com/believegamesstudios"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-[#E31B23] transition-colors p-1"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/believe-studios"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-[#E31B23] transition-colors p-1"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="#contact"
              className="px-3.5 py-1.5 rounded-full bg-[#E31B23] text-white text-xs font-bold hover:bg-[#c9151c] transition-colors shadow-sm"
            >
              Get in Touch
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-800"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200/80 space-y-2 animate-in fade-in">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm font-semibold text-neutral-800 hover:text-[#E31B23] hover:bg-neutral-50 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
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
