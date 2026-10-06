"use client"

import React, { useMemo, useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useFBX } from "@react-three/drei"
import * as THREE from "three"
import { generateTrafficRoutes, RouteDefinition } from "./trafficRoutes"

const CAR_PATHS = [
  "/Designersoup Low Poly Car Pack 2/Exports/Multiplx.fbx",
  "/Designersoup Low Poly Car Pack 2/Exports/Smarty.fbx",
  "/Designersoup Low Poly Car Pack 2/Exports/Stuttgart996.fbx",
  "/Designersoup Low Poly Car Pack 2/Exports/Tois08_GT.fbx",
  "/Designersoup Low Poly Car Pack 2/Exports/Toro86.fbx",
]

CAR_PATHS.forEach((path) => useFBX.preload(path))

const CAR_COLORS = [
  "#38bdf8", // Sky Blue
  "#f43f5e", // Rose Red
  "#fbbf24", // Vibrant Yellow
  "#ec4899", // Pastel Pink
  "#34d399", // Mint Green
  "#f97316", // Warm Orange
  "#a855f7", // Purple
  "#ffffff", // Clean White
]

interface CarState {
  id: string
  position: THREE.Vector3
  tangent: THREE.Vector3
  speed: number
  baseSpeed: number
  routeId: string
}

interface SingleCarProps {
  id: string
  modelPath: string
  route: THREE.CatmullRomCurve3
  routeId: string
  baseSpeed: number
  initialProgress: number
  colorTint: string
  trafficRegistry: React.MutableRefObject<Map<string, CarState>>
}

function MovingCar({
  id,
  modelPath,
  route,
  routeId,
  baseSpeed,
  initialProgress,
  colorTint,
  trafficRegistry,
}: SingleCarProps) {
  const fbx = useFBX(modelPath)
  const groupRef = useRef<THREE.Group>(null)
  const progress = useRef(initialProgress)
  const currentSpeed = useRef(baseSpeed)

  const carModel = useMemo(() => {
    const clone = fbx.clone(true)

    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const center = new THREE.Vector3()
    box.getCenter(center)

    // Normalize length to ~2.8 units for generous clearance in a 5.6-unit road
    const maxDim = Math.max(size.x, size.z)
    const targetLength = 2.8
    const s = targetLength / (maxDim || 1)

    clone.position.set(-center.x * s, -box.min.y * s, -center.z * s)
    clone.scale.set(s, s, s)

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true

        if (mesh.material) {
          const cloneMaterial = (m: THREE.Material) => {
            const mat = m.clone() as THREE.MeshStandardMaterial
            if (
              mat.name?.toLowerCase().includes("paint") ||
              mat.name?.toLowerCase().includes("body") ||
              mat.name?.toLowerCase().includes("car") ||
              mat.name?.toLowerCase().includes("primary")
            ) {
              mat.color = new THREE.Color(colorTint)
            }
            return mat
          }

          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(cloneMaterial)
          } else {
            mesh.material = cloneMaterial(mesh.material)
          }
        }
      }
    })

    return clone
  }, [fbx, colorTint])

  useEffect(() => {
    return () => {
      trafficRegistry.current.delete(id)
    }
  }, [id, trafficRegistry])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const currentPos = route.getPointAt(progress.current)
    const tangent = route.getTangentAt(progress.current).normalize()

    trafficRegistry.current.set(id, {
      id,
      position: currentPos,
      tangent,
      speed: currentSpeed.current,
      baseSpeed,
      routeId,
    })

    // --- LANE-SPECIFIC RADAR FOLLOWING LOGIC ---
    let targetSpeed = baseSpeed
    const SAFE_DISTANCE = 4.2
    const STOP_DISTANCE = 2.8
    const perp = new THREE.Vector3(-tangent.z, 0, tangent.x)

    trafficRegistry.current.forEach((other) => {
      if (other.id === id) return

      const toOther = new THREE.Vector3().subVectors(other.position, currentPos)

      // 1. Must be driving in the same general direction (> 0.7 dot)
      // Completely excludes opposing lane traffic
      const headingDot = tangent.dot(other.tangent)
      if (headingDot < 0.7) return

      // 2. Must be in our exact lane (perpendicular offset < 1.0 unit)
      // Completely excludes adjacent lane traffic
      const lateralDist = Math.abs(toOther.dot(perp))
      if (lateralDist > 1.0) return

      // 3. Must be ahead of us in our travel direction
      const longDist = toOther.dot(tangent)
      if (longDist > 0.4 && longDist < SAFE_DISTANCE) {
        if (longDist < STOP_DISTANCE) {
          targetSpeed = 0 // Stop to avoid rear-ending
        } else {
          // Slow down smoothly to match lead vehicle
          targetSpeed = Math.min(baseSpeed * 0.5, Math.max(0.01, other.speed))
        }
      }
    })

    const accelRate = targetSpeed < currentSpeed.current ? 8 : 3
    currentSpeed.current += (targetSpeed - currentSpeed.current) * Math.min(1, delta * accelRate)

    progress.current += currentSpeed.current * delta
    if (progress.current > 1) progress.current -= 1
    if (progress.current < 0) progress.current += 1

    groupRef.current.position.set(currentPos.x, 0.025, currentPos.z)

    const heading = Math.atan2(tangent.x, tangent.z) + Math.PI / 2
    groupRef.current.rotation.y = heading
  })

  return (
    <group ref={groupRef}>
      <primitive object={carModel} />
    </group>
  )
}

// 3D Visual Path Line Renderer
function VisualPathLine({ route }: { route: RouteDefinition }) {
  const linePoints = useMemo(() => {
    // Sample 160 smooth points along the closed curve
    const pts = route.curve.getPoints(160)
    // Lift slightly above road (y = 0.06) so it's fully visible
    return pts.map((p) => new THREE.Vector3(p.x, 0.06, p.z))
  }, [route])

  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(linePoints)
    return geom
  }, [linePoints])

  return (
    <group>
      {/* Road Track Line */}
      <lineLoop geometry={lineGeometry}>
        <lineBasicMaterial color={route.color} linewidth={3} />
      </lineLoop>

      {/* Discrete waypoint markers to show key corner points */}
      {route.points.map((pt, idx) => (
        <mesh key={idx} position={[pt.x, 0.08, pt.z]}>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 12]} />
          <meshBasicMaterial color={route.color} />
        </mesh>
      ))}
    </group>
  )
}

export function Traffic({
  showPathLines = false,
  routeOverrides,
}: {
  showPathLines?: boolean
  routeOverrides?: Record<string, [number, number, number][]>
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const routes = useMemo(() => generateTrafficRoutes(routeOverrides), [routeOverrides])
  const trafficRegistry = useRef<Map<string, CarState>>(new Map())

  // Spawn random 5 to 20 cars evenly distributed across routes
  const carConfigs = useMemo(() => {
    const count = Math.floor(Math.random() * 16) + 5
    const configs = []

    for (let i = 0; i < count; i++) {
      const modelPath = CAR_PATHS[Math.floor(Math.random() * CAR_PATHS.length)]
      const routeObj = routes[i % routes.length]

      const baseSpeed = 0.022 + Math.random() * 0.012

      const carsOnSameRoute = Math.floor(count / routes.length) + 1
      const slot = Math.floor(i / routes.length)
      const initialProgress = (slot / carsOnSameRoute + Math.random() * 0.04) % 1

      const colorTint = CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)]

      configs.push({
        id: `car-${i}`,
        modelPath,
        route: routeObj.curve,
        routeId: routeObj.id,
        baseSpeed,
        initialProgress,
        colorTint,
      })
    }

    return configs
  }, [routes])

  if (!mounted) return null

  return (
    <group name="CityTraffic">
      {/* Visual Path Lines (Rendered when toggled on) */}
      {showPathLines && (
        <group name="VisualPaths">
          {routes.map((r) => (
            <VisualPathLine key={r.id} route={r} />
          ))}
        </group>
      )}

      {/* Cars */}
      {carConfigs.map((cfg) => (
        <MovingCar
          key={cfg.id}
          id={cfg.id}
          modelPath={cfg.modelPath}
          route={cfg.route}
          routeId={cfg.routeId}
          baseSpeed={cfg.baseSpeed}
          initialProgress={cfg.initialProgress}
          colorTint={cfg.colorTint}
          trafficRegistry={trafficRegistry}
        />
      ))}
    </group>
  )
}
