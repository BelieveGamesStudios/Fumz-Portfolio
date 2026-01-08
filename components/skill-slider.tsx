"use client"

import { useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { useRef } from "react"

interface SkillSliderProps {
    value: number
    className?: string
    ariaLabel?: string
}

export function SkillSlider({ value, className, ariaLabel }: SkillSliderProps) {
    const [currentValue, setCurrentValue] = useState(0)
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.5 })

    useEffect(() => {
        if (isInView) {
            // Animate from 0 to value over 1.5 seconds
            const timeout = setTimeout(() => {
                const controls = {
                    value: 0
                }

                let startTime = performance.now()
                const duration = 1500 // 1.5s

                const animate = (currentTime: number) => {
                    const elapsed = currentTime - startTime
                    const progress = Math.min(elapsed / duration, 1)

                    // Ease out cubic
                    const easeProgress = 1 - Math.pow(1 - progress, 3)

                    const nextValue = Math.round(easeProgress * value)
                    setCurrentValue(nextValue)

                    if (progress < 1) {
                        requestAnimationFrame(animate)
                    }
                }

                requestAnimationFrame(animate)
            }, 200) // Small delay before start

            return () => clearTimeout(timeout)
        }
    }, [isInView, value])

    return (
        <div ref={ref} className={className}>
            <Slider
                value={[currentValue]}
                max={100}
                step={1}
                disabled
                className="w-full"
                aria-label={ariaLabel}
            />
        </div>
    )
}
