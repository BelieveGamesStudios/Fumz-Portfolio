"use client"

import React, { useMemo, useRef, useEffect } from "react"
import * as THREE from "three"
import { TransformControls, Html } from "@react-three/drei"
import { generateTrafficRoutes, RouteDefinition } from "@/components/city/trafficRoutes"
import { RouteWaypointMap } from "./types"

interface WaypointEditorProps {
  waypoints: RouteWaypointMap
  onChangeWaypoints: (updated: RouteWaypointMap) => void
  activeRouteId: string
  selectedWaypointIndex: number | null
  onSelectWaypoint: (index: number | null) => void
  isDraggingRef: React.MutableRefObject<boolean>
  visible: boolean
}

function WaypointGizmoSphere({
  point,
  index,
  isSelected,
  routeColor,
  onClick,
}: {
  point: [number, number, number]
  index: number
  isSelected: boolean
  routeColor: string
  onClick: (e: any) => void
}) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <group position={point}>
      <mesh
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[isSelected ? 0.55 : hovered ? 0.45 : 0.35, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? "#ffffff" : hovered ? "#fde047" : routeColor}
          emissive={isSelected ? "#38bdf8" : hovered ? "#fde047" : routeColor}
          emissiveIntensity={isSelected ? 0.9 : hovered ? 0.6 : 0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Point Index Tag for Selected/Hovered */}
      {(isSelected || hovered) && (
        <Html position={[0, 0.8, 0]} center pointerEvents="none">
          <div className="bg-slate-900/90 text-[10px] text-white font-mono px-1.5 py-0.5 rounded shadow border border-white/20 whitespace-nowrap">
            #{index} ({point[0].toFixed(1)}, {point[2].toFixed(1)})
          </div>
        </Html>
      )}

      {/* Selected Ground Ring */}
      {isSelected && (
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.9, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

export function WaypointEditor({
  waypoints,
  onChangeWaypoints,
  activeRouteId,
  selectedWaypointIndex,
  onSelectWaypoint,
  isDraggingRef,
  visible,
}: WaypointEditorProps) {
  const transformRef = useRef<any>(null)
  const waypointMeshRef = useRef<THREE.Group>(null)

  // Generate routes using the current customized waypoints
  const routes = useMemo(() => {
    return generateTrafficRoutes(waypoints)
  }, [waypoints])

  const activeRoute = useMemo(() => {
    return routes.find((r) => r.id === activeRouteId) || routes[0]
  }, [routes, activeRouteId])

  const activePoints = useMemo(() => {
    if (!activeRoute) return []
    return waypoints[activeRoute.id] || activeRoute.points.map((p) => [p.x, p.y, p.z] as [number, number, number])
  }, [activeRoute, waypoints])

  // Sync selected waypoint position to the invisible transform anchor
  useEffect(() => {
    if (
      selectedWaypointIndex !== null &&
      activePoints[selectedWaypointIndex] &&
      waypointMeshRef.current
    ) {
      const pt = activePoints[selectedWaypointIndex]
      waypointMeshRef.current.position.set(pt[0], 0.05, pt[2])
    }
  }, [selectedWaypointIndex, activePoints])

  if (!visible) return null

  const handleTransformChange = () => {
    if (!waypointMeshRef.current || selectedWaypointIndex === null) return
    const pos = waypointMeshRef.current.position
    const routeId = activeRoute?.id
    if (!routeId) return

    const currentList = [...activePoints]
    currentList[selectedWaypointIndex] = [
      Number(pos.x.toFixed(2)),
      0.05,
      Number(pos.z.toFixed(2)),
    ]

    onChangeWaypoints({
      ...waypoints,
      [routeId]: currentList,
    })
  }

  return (
    <group name="WaypointEditor">
      {/* 1. All Route Lines */}
      {routes.map((r) => {
        const isActive = r.id === activeRoute?.id
        const linePoints = r.curve.getPoints(120)

        const geometry = new THREE.BufferGeometry().setFromPoints(linePoints)

        return (
          <group key={r.id}>
            {/* Visual Spline Curve */}
            <primitive
              object={
                new THREE.Line(
                  geometry,
                  new THREE.LineBasicMaterial({
                    color: r.color,
                    linewidth: isActive ? 4 : 2,
                    transparent: true,
                    opacity: isActive ? 1.0 : 0.35,
                  })
                )
              }
            />
          </group>
        )
      })}

      {/* 2. Waypoint Spheres for Active Route */}
      {activeRoute &&
        activePoints.map((pt, idx) => {
          const isSelected = selectedWaypointIndex === idx
          return (
            <WaypointGizmoSphere
              key={`wp-${idx}`}
              point={pt}
              index={idx}
              isSelected={isSelected}
              routeColor={activeRoute.color}
              onClick={(e) => {
                e.stopPropagation()
                onSelectWaypoint(idx)
              }}
            />
          )
        })}

      {/* 3. Transform Gizmo for Selected Waypoint */}
      {selectedWaypointIndex !== null && activePoints[selectedWaypointIndex] && (
        <>
          <group
            ref={waypointMeshRef}
            position={[
              activePoints[selectedWaypointIndex][0],
              0.05,
              activePoints[selectedWaypointIndex][2],
            ]}
          />

          <TransformControls
            ref={transformRef}
            object={waypointMeshRef as any}
            mode="translate"
            showY={false} // Dragging locked to XZ ground plane
            size={0.7}
            translationSnap={0.2}
            onMouseDown={() => {
              isDraggingRef.current = true
            }}
            onMouseUp={() => {
              isDraggingRef.current = false
            }}
            onChange={handleTransformChange}
          />
        </>
      )}
    </group>
  )
}
