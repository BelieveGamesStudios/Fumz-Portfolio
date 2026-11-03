"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, Github, Linkedin } from "lucide-react"

const BRAND_TEXT = "BELIEVE STUDIOS"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Typewriter effect on load
    let currentIndex = 0
    let typeInterval: NodeJS.Timeout

    const startDelay = setTimeout(() => {
      typeInterval = setInterval(() => {
        currentIndex++
        setDisplayedText(BRAND_TEXT.slice(0, currentIndex))
        if (currentIndex >= BRAND_TEXT.length) {
          clearInterval(typeInterval)
          setIsTypingComplete(true)
        }
      }, 65)
    }, 250)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(startDelay)
      if (typeInterval) clearInterval(typeInterval)
    }
  }, [])

  const navItems = [
    { label: "Projects", href: "#projects" },
    { label: "About", href: "#about" },
    { label: "Collaboration", href: "#contact" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs py-2"
          : "bg-[#FAFAFC]/90 backdrop-blur-sm border-b border-neutral-200/30 py-3.5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo Badge & Identity */}
          <Link href="#" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white border border-neutral-200/90 shadow-sm flex items-center justify-center p-1.5 group-hover:border-[#E31B23] transition-colors flex-shrink-0">
              <img
                src="/apple-icon.png"
                alt="Believe Studios"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
                <div className="flex flex-col justify-center min-w-[130px] sm:min-w-[155px]">
                  <div className="flex items-center gap-1.5 h-4 sm:h-5">
                    <span className="text-xs sm:text-sm font-black tracking-wider text-neutral-900 uppercase">
                      {displayedText}
                    </span>
                    {!isTypingComplete && (
                      <span className="inline-block w-[2px] h-3 sm:h-3.5 bg-[#E31B23] animate-pulse" />
                    )}
                    <span
                  className={`w-1.5 h-1.5 rounded-full bg-[#E31B23] transition-all duration-500 ease-out ${isTypingComplete
                          ? "scale-100 opacity-100 shadow-[0_0_8px_#E31B23]"
                          : "scale-0 opacity-0"
                        }`}
                    />
                  </div>
                  <span
                className={`text-[10px] sm:text-[11px] text-neutral-500 font-medium tracking-tight transition-opacity duration-700 ${isTypingComplete ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    Afolabi Funmilade
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation with Hollow Bullet Dots */}
              <div className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-semibold text-neutral-700">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-2 hover:text-[#E31B23] transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full border border-neutral-400 group-hover:border-[#E31B23] group-hover:bg-[#E31B23] transition-colors" />
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>

              {/* Far Right: GitHub, LinkedIn & Get in Touch Button */}
              <div className="hidden md:flex items-center gap-4 text-neutral-700">
                <a
                  href="https://github.com/believegamesstudios"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="hover:text-[#E31B23] transition-colors p-1"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/believe-studios?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="hover:text-[#E31B23] transition-colors p-1"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#contact"
                  className="px-4 py-2 rounded-full bg-[#E31B23] text-white text-xs font-bold hover:bg-[#c9151c] transition-colors shadow-sm"
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
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
              <div className="md:hidden py-4 border-t border-neutral-200/80 space-y-3 bg-white/95 backdrop-blur-md px-2 rounded-b-2xl shadow-lg mt-2 animate-in fade-in">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-neutral-800 hover:text-[#E31B23] hover:bg-neutral-50 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23]" />
                    <span>{item.label}</span>
                  </a>
                ))}

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between px-3">
                  <div className="flex items-center gap-3 text-neutral-700">
                    <a
                      href="https://github.com/believegamesstudios"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="hover:text-[#E31B23] transition-colors p-1"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/believe-studios?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="hover:text-[#E31B23] transition-colors p-1"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                  <a
                    href="#contact"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-1.5 rounded-full bg-[#E31B23] text-white text-xs font-bold hover:bg-[#c9151c] transition-colors shadow-sm"
                  >
                    Get in Touch
                  </a>
                </div>
              </div>
            )}
        </div>
    </nav>
  )
}
