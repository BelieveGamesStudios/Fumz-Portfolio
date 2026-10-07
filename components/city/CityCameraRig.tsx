"use client"

import { useEffect, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { PlacedBuilding } from "@/components/map-editor/types"

interface CityCameraRigProps {
  targetBuilding: PlacedBuilding | null
  isModalOpen: boolean
  controlsRef: React.RefObject<any>
}

const DEFAULT_POS = new THREE.Vector3(0, 62, 50)
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0)
const ANIMATION_DURATION = 0.8 // seconds

export function CityCameraRig({ targetBuilding, isModalOpen, controlsRef }: CityCameraRigProps) {
  const { camera } = useThree()

  const isAnimating = useRef(false)
  const animStartTime = useRef(0)
  const isInitialMount = useRef(true)

  const startCamPos = useRef(DEFAULT_POS.clone())
  const startTarget = useRef(DEFAULT_TARGET.clone())
  const endCamPos = useRef(DEFAULT_POS.clone())
  const endTarget = useRef(DEFAULT_TARGET.clone())

  // Stop automated animations immediately when the user manually interacts
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const handleUserInteraction = () => {
      isAnimating.current = false
    }

    controls.addEventListener("start", handleUserInteraction)
    return () => {
      controls.removeEventListener("start", handleUserInteraction)
    }
  }, [controlsRef.current])

  // Compute target and initiate deterministic transition
  useEffect(() => {
    // Skip animation on initial mount if there is no initial building targeted
    if (isInitialMount.current) {
      isInitialMount.current = false
      if (!targetBuilding) return
    }

    const controls = controlsRef.current

    startCamPos.current.copy(camera.position)
    startTarget.current.copy(controls ? controls.target : DEFAULT_TARGET)

    if (targetBuilding) {
      const [bx, by, bz] = targetBuilding.position
      const [sx, sy, sz] = targetBuilding.scale
      const maxDim = Math.max(sx || 6, sy || 8, sz || 6)

      // Focus point roughly near center-top of building
      const focusY = by + (sy || 8) * 0.45
      endTarget.current.set(bx, focusY, bz)

      // Elevated isometric angle offset for framing
      const dist = Math.max(18, maxDim * 1.9 + 10)
      endCamPos.current.set(bx + dist * 0.7, by + dist * 0.75, bz + dist * 0.9)
    } else {
      // Deterministically restore to default overview
      endCamPos.current.copy(DEFAULT_POS)
      endTarget.current.copy(DEFAULT_TARGET)
    }

    animStartTime.current = performance.now() / 1000
    isAnimating.current = true
  }, [targetBuilding, camera, controlsRef])

  useFrame(() => {
    if (!isAnimating.current) return

    const controls = controlsRef.current
    const now = performance.now() / 1000
    const elapsed = now - animStartTime.current
    const rawProgress = Math.min(1, elapsed / ANIMATION_DURATION)

    // Smooth cubic ease-out
    const ease = 1 - Math.pow(1 - rawProgress, 3)

    camera.position.lerpVectors(startCamPos.current, endCamPos.current, ease)

    if (controls) {
      controls.target.lerpVectors(startTarget.current, endTarget.current, ease)
      controls.update()
    } else {
      camera.lookAt(endTarget.current)
    }

    if (rawProgress >= 1) {
      camera.position.copy(endCamPos.current)
      if (controls) {
        controls.target.copy(endTarget.current)
        controls.update()
      }
      isAnimating.current = false
    }
  })

  // Disable controls when modal is open to prevent canvas interaction behind overlay
  useEffect(() => {
    const controls = controlsRef.current
    if (controls) {
      controls.enabled = !isModalOpen
    }
  }, [isModalOpen, controlsRef])

  return null
}
