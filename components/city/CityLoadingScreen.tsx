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
      style={{ background: "#18191A" }}
    >
      {/* Warm architectural backdrop, replacing the previous blue city artwork. */}
      <div className="absolute inset-0 overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(208,138,99,0.22),transparent_30%),linear-gradient(145deg,#18191A_0%,#211D1B_58%,#321F18_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[44%] opacity-60 bg-[linear-gradient(90deg,transparent_0_7%,#87482D_7%_13%,transparent_13%_17%,#4C2D22_17%_25%,transparent_25%_31%,#A85C3A_31%_43%,transparent_43%_48%,#603523_48%_57%,transparent_57%_64%,#87482D_64%_75%,transparent_75%_81%,#A85C3A_81%_92%,transparent_92%)] [clip-path:polygon(0_100%,0_52%,7%_52%,7%_26%,13%_26%,13%_60%,17%_60%,17%_38%,25%_38%,25%_68%,31%_68%,31%_15%,43%_15%,43%_56%,48%_56%,48%_31%,57%_31%,57%_72%,64%_72%,64%_23%,75%_23%,75%_62%,81%_62%,81%_35%,92%_35%,92%_70%,100%_70%,100%_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(243,235,230,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(243,235,230,0.35)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#211E1C]/80 border border-[#87482D]/50 backdrop-blur-md">
          <Building2 className="w-4 h-4 text-[#D08A63] animate-pulse" />
          <span className="text-xs font-mono font-medium tracking-wider text-[#F3EBE6] uppercase">
            3D Interactive Environment
          </span>
        </div>
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto w-full px-4">
        {/* Glowing animated badge */}
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#87482D] to-[#D08A63] opacity-60 blur-lg animate-pulse" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#211E1C]/90 border border-[#D08A63]/40 backdrop-blur-xl shadow-2xl">
            <Loader2 className="w-8 h-8 text-[#D08A63] animate-spin" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-bold tracking-wider text-white font-mono uppercase drop-shadow-md">
          Believe City Loading
        </h1>
        <p className="mt-2 text-sm text-[#CDBCB3] font-sans">
          Building your interactive portfolio district...
        </p>

        {/* Progress Bar Container */}
        <div className="w-full mt-8">
          <div className="flex justify-between items-center text-xs font-mono text-[#BCAA9F] mb-2">
            <span>{isConfigLoaded ? "Loading models..." : "Fetching city configuration..."}</span>
            <span className="text-[#D08A63] font-semibold">{displayProgress}%</span>
          </div>
          <div className="w-full h-2 bg-[#292421]/90 border border-[#5A3B2E]/70 rounded-full overflow-hidden p-0.5 backdrop-blur-sm shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#87482D] via-[#B96943] to-[#D6A084] rounded-full transition-all duration-300 ease-out shadow-[0_0_14px_rgba(168,92,58,0.65)]"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center text-[10px] text-[#BCAA9F] font-mono uppercase tracking-[0.2em]">
        Fumz · immersive portfolio
      </div>
    </div>
  )
}
