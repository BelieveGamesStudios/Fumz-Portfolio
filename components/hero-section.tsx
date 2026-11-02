"use client"

import React, { useState, useEffect } from "react"
import { X, ExternalLink, Github, Linkedin, Twitter, Youtube, Instagram, Sparkles } from "lucide-react"

const ARSENAL_ICONS = [
  {
    name: "Unity",
    icon: "/Icons/Unity.svg",
    category: "Game & XR Engine",
    position: "top-[14%] right-[10%] sm:right-[13%] lg:right-[15%]",
    delay: "0s",
  },
  {
    name: "Unreal Engine",
    icon: "/Icons/unreal.svg",
    category: "Real-time 3D",
    position: "top-[30%] right-[3%] sm:right-[5%] lg:right-[6%]",
    delay: "1.2s",
  },
  {
    name: "Blender",
    icon: "/Icons/Blender.svg",
    category: "3D Modeling & VFX",
    position: "top-[48%] right-[12%] sm:right-[16%] lg:right-[17%]",
    delay: "0.6s",
  },
  {
    name: "Meta Quest",
    icon: "/Icons/meta-svgrepo-com.svg",
    category: "Spatial Computing",
    position: "top-[68%] right-[4%] sm:right-[6%] lg:right-[7%]",
    delay: "1.8s",
  },
  {
    name: "Nintendo Switch",
    icon: "/Icons/Nintendo.svg",
    category: "Console Gaming",
    position: "top-[49%] left-[11%] sm:left-[13%] lg:left-[15%]",
    delay: "0.9s",
  },
  {
    name: "DaVinci Resolve",
    icon: "/Icons/Davinciresolve.svg",
    category: "Color & Video",
    position: "top-[83%] left-[11%] sm:left-[13%] lg:left-[15%]",
    delay: "2.1s",
  },
  {
    name: "GIMP",
    icon: "/Icons/Gimp.svg",
    category: "2D Art & Textures",
    position: "top-[32%] left-[3%] sm:left-[5%] lg:left-[6%]",
    delay: "1.5s",
  },
  {
    name: "Audacity",
    icon: "/Icons/audacity.svg",
    category: "Spatial Audio & SFX",
    position: "top-[66%] left-[3%] sm:left-[5%] lg:left-[6%]",
    delay: "2.5s",
  },
]

export function HeroSection() {
  const [titleMode, setTitleMode] = useState<"fumz" | "afolabi" | "arda">("fumz")
  const [isSeparated, setIsSeparated] = useState(false)
  const [isBrandAnimated, setIsBrandAnimated] = useState(false)

  // Trigger animation after page load
  useEffect(() => {
    const brandTimer = setTimeout(() => {
      setIsBrandAnimated(true)
    }, 150)

    const timer = setTimeout(() => {
      setIsSeparated(true)
    }, 400)

    return () => {
      clearTimeout(brandTimer)
      clearTimeout(timer)
    }
  }, [])

  const handleToggleTitle = () => {
    setIsBrandAnimated(false)
    setIsSeparated(false)
    setTitleMode((prev) => (prev === "fumz" ? "afolabi" : prev === "afolabi" ? "arda" : "fumz"))
    setTimeout(() => {
      setIsBrandAnimated(true)
      setIsSeparated(true)
    }, 200)
  }

  return (
    <section className="relative w-full min-h-screen bg-[#FAFAFC] text-neutral-900 overflow-hidden flex flex-col justify-between selection:bg-[#E31B23] selection:text-white">
      {/* ===================== TOP HEADER / NAVIGATION ===================== */}
      <header className="relative z-30 w-full px-4 sm:px-8 lg:px-14 pt-6 pb-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Red Circle Badge + Identity */}
          <div className="flex items-center gap-3.5">
            {/* App Logo */}
            <button
              onClick={handleToggleTitle}
              title="Click to toggle name typography"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-neutral-200/90 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0 hover:scale-105 hover:border-[#E31B23] active:scale-95 transition-all cursor-pointer overflow-hidden"
            >
              <img
                src="/apple-icon.png"
                alt="App Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </button>

            {/* Club / Studio & Role Info */}
            <div className="flex flex-col overflow-hidden">
              <div
                className={`flex items-center gap-1.5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isBrandAnimated
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-6"
                }`}
              >
                <span className="text-xs sm:text-sm font-black tracking-wider text-neutral-900 uppercase">
                  {titleMode === "arda" ? "Real Madrid CF" : "Believe Studios"}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-[#E31B23] transition-all duration-500 delay-300 ease-out ${
                    isBrandAnimated ? "scale-100 opacity-100 shadow-[0_0_8px_#E31B23]" : "scale-0 opacity-0"
                  }`}
                />
              </div>
              <span
                className={`text-[11px] sm:text-xs text-neutral-500 font-medium tracking-tight transition-all duration-700 delay-150 ease-out ${
                  isBrandAnimated
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1.5"
                }`}
              >
                {titleMode === "arda"
                  ? "Attacking Midfielder and Winger"
                  : "XR & Game Developer • Unity Specialist"}
              </span>
            </div>
          </div>

          {/* Center-Right: Navigation with Hollow Circle Bullets */}
          <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-semibold text-neutral-700">
            <a
              href="#projects"
              className="group flex items-center gap-2 hover:text-[#E31B23] transition-colors"
            >
              <span className="w-2 h-2 rounded-full border border-neutral-400 group-hover:border-[#E31B23] group-hover:bg-[#E31B23] transition-colors" />
              <span>Partners</span>
            </a>
            <a
              href="#contact"
              className="group flex items-center gap-2 hover:text-[#E31B23] transition-colors"
            >
              <span className="w-2 h-2 rounded-full border border-neutral-400 group-hover:border-[#E31B23] group-hover:bg-[#E31B23] transition-colors" />
              <span>Collaboration</span>
            </a>
          </nav>

          {/* Far Right: Social Media Icons (TikTok, Instagram, Threads, YouTube, X, GitHub) */}
          <div className="flex items-center gap-3 sm:gap-4 text-neutral-700">
            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="hover:text-[#E31B23] transition-colors p-1"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.48 6.27 6.27 0 0 0 1.88-4.48V8.71a8.21 8.21 0 0 0 4.9 1.58V6.84a4.83 4.83 0 0 1-1-.15Z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-[#E31B23] transition-colors p-1"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* Threads / LinkedIn */}
            <a
              href="https://www.linkedin.com/in/believe-studios?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-[#E31B23] transition-colors p-1"
            >
              <Linkedin className="w-4 h-4" />
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-[#E31B23] transition-colors p-1"
            >
              <Youtube className="w-4 h-4" />
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="hover:text-[#E31B23] transition-colors p-1"
            >
              <Twitter className="w-4 h-4" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/believegamesstudios"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-[#E31B23] transition-colors p-1"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ===================== HERO MAIN STAGE ===================== */}
      <div className="relative flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-14 py-4 sm:py-6">
        
        {/* Layer 1: Giant Background Typographic Banner (Red)
            Starts together as one word in the middle, then slides apart directly beside the character */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden">
          <div className="relative flex items-center justify-center">
            {titleMode === "arda" ? (
              <>
                <span
                  className={`font-bebas text-[20vw] sm:text-[18vw] lg:text-[19vw] font-black text-[#E31B23] tracking-tight leading-none uppercase select-none transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSeparated
                      ? "-translate-x-28 sm:-translate-x-40 md:-translate-x-52 lg:-translate-x-60 xl:-translate-x-68"
                      : "translate-x-0"
                  }`}
                >
                  ARDA
                </span>
                <span
                  className={`font-bebas text-[20vw] sm:text-[18vw] lg:text-[19vw] font-black text-[#E31B23] tracking-tight leading-none uppercase select-none transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSeparated
                      ? "translate-x-28 sm:translate-x-40 md:translate-x-52 lg:translate-x-60 xl:translate-x-68"
                      : "translate-x-0"
                  }`}
                >
                  GÜLER
                </span>
              </>
            ) : titleMode === "afolabi" ? (
              <>
                <span
                  className={`font-bebas text-[16vw] sm:text-[14vw] lg:text-[15vw] font-black text-[#E31B23] tracking-tight leading-none uppercase select-none transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSeparated
                      ? "-translate-x-28 sm:-translate-x-44 md:-translate-x-56 lg:-translate-x-68"
                      : "translate-x-0"
                  }`}
                >
                  AFOLABI
                </span>
                <span
                  className={`font-bebas text-[16vw] sm:text-[14vw] lg:text-[15vw] font-black text-[#E31B23] tracking-tight leading-none uppercase select-none transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSeparated
                      ? "translate-x-28 sm:translate-x-44 md:translate-x-56 lg:translate-x-68"
                      : "translate-x-0"
                  }`}
                >
                  FUNMILADE
                </span>
              </>
            ) : (
              <>
                {/* FU: slides closer to the character so U lines up with 'I' below */}
                <span
                  className={`font-bebas text-[24vw] sm:text-[22vw] lg:text-[21vw] font-black text-[#E31B23] tracking-tight leading-none uppercase select-none transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSeparated
                      ? "-translate-x-12 sm:-translate-x-16 md:-translate-x-20 lg:-translate-x-24 xl:-translate-x-28"
                      : "translate-x-0"
                  }`}
                >
                  FU
                </span>
                {/* MZ: slides to the right directly beside the character */}
                <span
                  className={`font-bebas text-[24vw] sm:text-[22vw] lg:text-[21vw] font-black text-[#E31B23] tracking-tight leading-none uppercase select-none transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isSeparated
                      ? "translate-x-14 sm:translate-x-18 md:translate-x-22 lg:translate-x-28 xl:translate-x-32"
                      : "translate-x-0"
                  }`}
                >
                  MZ
                </span>
              </>
            )}
          </div>
        </div>

        {/* Layer 2: Spread-out Floating Tech Arsenal Icons (No box) */}
        {ARSENAL_ICONS.map((item) => (
          <div
            key={item.name}
            style={{ animationDelay: item.delay }}
            className={`absolute ${item.position} z-20 animate-float-gentle pointer-events-auto transition-transform duration-300 hover:scale-125 hover:z-40 cursor-pointer group select-none`}
          >
            <div className="relative p-2 sm:p-2.5 lg:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] group-hover:border-[#E31B23] group-hover:shadow-[0_8px_25px_rgba(227,27,35,0.22)] transition-all">
              <img
                src={item.icon}
                alt={item.name}
                className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6 object-contain"
              />
            </div>
            {/* Tooltip on hover */}
            <div className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-0.5 text-[9px] font-bold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 z-50">
              {item.name}
            </div>
          </div>
        ))}

        {/* Layer 3: Center Cutout Portrait (Fumz Transparent)
            Slides in from bottom to separate the letters */}
        <div
          className={`absolute inset-x-0 bottom-0 top-12 z-20 flex justify-center items-end pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isSeparated
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-48 sm:translate-y-64 opacity-0 scale-95"
          }`}
        >
          <img
            src="/Fumz Transparent.png"
            alt="Afolabi Funmilade (Fumz)"
            className="h-[68vh] sm:h-[76vh] lg:h-[84vh] max-h-[850px] w-auto object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.22)] select-none pointer-events-auto"
          />
        </div>

        {/* Layer 4: Left Side Content (Statement Block) */}
        <div className="relative z-30 flex flex-col justify-center max-w-xs sm:max-w-sm pt-8 sm:pt-16 pb-20">
          {/* Quote Block */}
          <div>
            <span className="block text-3xl sm:text-4xl font-serif text-neutral-900 font-bold leading-none mb-1">
              &ldquo;
            </span>
            <p className="text-xs sm:text-sm md:text-[15px] font-extrabold uppercase tracking-tight text-neutral-900 leading-snug">
              {titleMode === "arda" ? (
                <>
                  ONLY A FEW OF MY DREAMS<br />
                  HAVE COME TRUE; I STILL HAVE<br />
                  A LOT OF DREAMS TO ACHIEVE.
                </>
              ) : (
                <>
                  Building the impossible and<br />
                  innovating in Games, XR and 3D.
                </>
              )}
            </p>
            <p className="text-[11px] text-neutral-500 font-semibold mt-2 tracking-wide uppercase">
              {titleMode === "arda" ? "Arda Güler" : "Afolabi Funmilade (Fumz)"}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
