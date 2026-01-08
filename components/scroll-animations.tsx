"use client"

import { useEffect } from "react"
import { useRevealEffect } from "@/hooks/use-reveal-effect"

export function ScrollAnimations() {
  useRevealEffect()

  useEffect(() => {
    // Handle scroll-triggered animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in", "fade-in", "duration-700")

          // Add specific animation classes based on data attribute
          const animationType = (entry.target as HTMLElement).dataset.animation
          if (animationType === "slide-left") {
            entry.target.classList.add("slide-in-from-left-4")
          } else if (animationType === "slide-right") {
            entry.target.classList.add("slide-in-from-right-4")
          } else if (animationType === "slide-up") {
            entry.target.classList.add("slide-in-from-bottom-4")
          }

          // If this is the skills section, toggle the fluorescent underline (on when intersecting).
          if ((entry.target as HTMLElement).id === 'skills') {
            ; (entry.target as HTMLElement).classList.toggle('fluoro-on', true)
            // Don't unobserve skills — we want to toggle off when it leaves the viewport
          } else {
            // Stop observing once animated (other elements don't need to toggle)
            observer.unobserve(entry.target)
          }
        } else {
          // If element left viewport, and it's the skills section, toggle the fluorescent off
          if ((entry.target as HTMLElement).id === 'skills') {
            ; (entry.target as HTMLElement).classList.toggle('fluoro-on', false)
          }
        }
      })
    }, observerOptions)

    // Observe all elements with data-scroll-animate attribute
    document.querySelectorAll("[data-scroll-animate]").forEach((el) => {
      observer.observe(el)
    })

    // Parallax effect on scroll
    const handleScroll = () => {
      const parallaxElements = document.querySelectorAll("[data-parallax]")
      const scrollY = window.scrollY

      parallaxElements.forEach((element) => {
        const speed = Number((element as HTMLElement).dataset.parallax) || 0.5
        const yPos = scrollY * speed
          ; (element as HTMLElement).style.transform = `translateY(${yPos}px)`
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      observer.disconnect()
    }
  }, [])

  return null
}
