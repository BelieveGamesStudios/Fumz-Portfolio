"use client"

import React, { useState, useEffect } from "react"

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
  const [isSeparated, setIsSeparated] = useState(false)

  // Trigger letter slide-apart animation after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSeparated(true)
    }, 350)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative w-full min-h-screen bg-[#FAFAFC] text-neutral-900 overflow-hidden flex flex-col justify-between pt-20 sm:pt-24 lg:pt-26 selection:bg-[#E31B23] selection:text-white">
      {/* ===================== HERO MAIN STAGE ===================== */}
      <div className="relative flex-1 flex flex-col justify-between max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-14 py-4 sm:py-6">
        
        {/* Layer 1: Giant Background Typographic Banner (Red)
            Starts together as one word in the middle, then slides apart directly beside the character */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden">
          <div className="relative flex items-center justify-center">
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
          </div>
        </div>

        {/* Layer 2: Spread-out Floating Tech Arsenal Icons (No box) */}
        {ARSENAL_ICONS.map((item) => (
          <div
            key={item.name}
            style={{ animationDelay: item.delay }}
            className={`absolute ${item.position} z-20 animate-float-gentle pointer-events-auto transition-transform duration-300 hover:scale-125 hover:z-40 cursor-pointer group select-none`}
          >
            <div className="relative p-3 sm:p-3.5 lg:p-4 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-[0_6px_24px_rgba(0,0,0,0.08)] group-hover:border-[#E31B23] group-hover:shadow-[0_10px_30px_rgba(227,27,35,0.25)] transition-all">
              <img
                src={item.icon}
                alt={item.name}
                className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 object-contain"
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
              Building the impossible and<br />
              innovating in Games, XR and 3D.
            </p>
            <p className="text-[11px] text-neutral-500 font-semibold mt-2 tracking-wide uppercase">
              Afolabi Funmilade (Fumz)
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
