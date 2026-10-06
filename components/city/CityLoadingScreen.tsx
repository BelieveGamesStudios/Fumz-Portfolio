"use client"

import React, { useEffect, useState } from "react"
import { useProgress } from "@react-three/drei"
import { Loader2, Building2 } from "lucide-react"

interface CityLoadingScreenProps {
  isConfigLoaded: boolean
  onLoaded?: () => void
}

export function CityLoadingScreen({ isConfigLoaded, onLoaded }: CityLoadingScreenProps) {
  const { active, progress } = useProgress()
  const [displayProgress, setDisplayProgress] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [shouldUnmount, setShouldUnmount] = useState(false)

  // Smoothly interpolate display progress
  useEffect(() => {
    const target = isConfigLoaded ? (active ? Math.max(progress, 30) : 100) : Math.min(progress, 40)
    
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < target) {
          const step = Math.max(1, (target - prev) * 0.2)
          return Math.min(target, Math.round(prev + step))
        }
        return prev
      })
    }, 30)

    return () => clearInterval(interval)
  }, [progress, active, isConfigLoaded])

  // Detect when everything is ready
  useEffect(() => {
    if (isConfigLoaded && (!active || progress === 100)) {
      const timer = setTimeout(() => {
        setDisplayProgress(100)
        setIsDone(true)
        if (onLoaded) onLoaded()

        // Wait for fade out animation before unmounting
        const unmountTimer = setTimeout(() => {
          setShouldUnmount(true)
        }, 800)
        return () => clearTimeout(unmountTimer)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isConfigLoaded, active, progress, onLoaded])

  if (shouldUnmount) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-10 transition-opacity duration-700 select-none ${
        isDone ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundImage: "url('/loading.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay gradient for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-950/80 backdrop-blur-[2px] -z-10" />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-md">
          <Building2 className="w-4 h-4 text-sky-400 animate-pulse" />
          <span className="text-xs font-mono font-medium tracking-wider text-slate-200 uppercase">
            3D Interactive Environment
          </span>
        </div>
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto w-full px-4">
        {/* Glowing animated badge */}
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 opacity-60 blur-lg animate-pulse" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900/80 border border-sky-500/30 backdrop-blur-xl shadow-2xl">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-bold tracking-wider text-white font-mono uppercase drop-shadow-md">
          Believe City Loading
        </h1>
        <p className="mt-2 text-sm text-slate-300 font-sans">
          Loading layout & preparing simulation...
        </p>

        {/* Progress Bar Container */}
        <div className="w-full mt-8">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
            <span>{isConfigLoaded ? "Loading models..." : "Fetching city configuration..."}</span>
            <span className="text-sky-400 font-semibold">{displayProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800/80 border border-slate-700/60 rounded-full overflow-hidden p-0.5 backdrop-blur-sm shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-400 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="flex justify-end items-center text-[11px] text-slate-400/90 font-sans">
        <div className="bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800/60 text-right">
          Image by{" "}
          <a
            href="https://pixabay.com/users/camera-man-16096197/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=7921255"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-200 underline decoration-slate-500 hover:text-sky-300 hover:decoration-sky-400 transition-colors"
          >
            Sergio Cerrato - Italia
          </a>{" "}
          from{" "}
          <a
            href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=7921255"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-200 underline decoration-slate-500 hover:text-sky-300 hover:decoration-sky-400 transition-colors"
          >
            Pixabay
          </a>
        </div>
      </div>
    </div>
  )
}
