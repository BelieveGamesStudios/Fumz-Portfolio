"use client"

import { useEffect } from "react"

export function useRevealEffect() {
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            document.querySelectorAll(".reveal-card, .reveal-border").forEach((el) => {
                const rect = el.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top

                    ; (el as HTMLElement).style.setProperty("--x", `${x}px`)
                    ; (el as HTMLElement).style.setProperty("--y", `${y}px`)
            })
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])
}
