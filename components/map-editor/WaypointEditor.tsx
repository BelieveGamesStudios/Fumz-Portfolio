"use client"

import React, { useMemo, useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"
import { TransformControls, Html } from "@react-three/drei"
import { generateTrafficRoutes } from "@/components/city/trafficRoutes"
import { RouteWaypointMap } from "./types"

interface WaypointEditorProps {
  waypoints: RouteWaypointMap
  disabledRoutes?: string[]
  onChangeWaypoints: (updated: RouteWaypointMap) => void
  activeRouteId: string
  selectedWaypointIndex: number | null
  onSelectWaypoint: (index: number | null) => void
  isDraggingRef: React.MutableRefObject<boolean>
  onDraggingChange?: (isDragging: boolean) => void
  visible: boolean
}

// Plane for direct ground drag raycasting
const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.05)

function InteractiveWaypointNode({
  point,
  index,
  isSelected,
  isRouteDisabled,
  routeColor,
  onSelect,
  onDragMove,
  onDragStart,
  onDragEnd,
}: {
  point: [number, number, number]
  index: number
  isSelected: boolean
  isRouteDisabled: boolean
  routeColor: string
  onSelect: () => void
  onDragMove: (newPos: [number, number, number]) => void
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isDragging = useRef(false)
  const { raycaster } = useThree()
  const intersectionPoint = useMemo(() => new THREE.Vector3(), [])

  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    onSelect()
    isDragging.current = true
    onDragStart()
    e.target.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: any) => {
    if (!isDragging.current) return
    e.stopPropagation()

    // Raycast onto ground plane (y = 0.05)
    if (raycaster.ray.intersectPlane(GROUND_PLANE, intersectionPoint)) {
      const clampedX = Number(Math.max(-45, Math.min(45, intersectionPoint.x)).toFixed(2))
      const clampedZ = Number(Math.max(-35, Math.min(35, intersectionPoint.z)).toFixed(2))
      onDragMove([clampedX, 0.05, clampedZ])
    }
  }

  const handlePointerUp = (e: any) => {
    if (isDragging.current) {
      e.stopPropagation()
      isDragging.current = false
      onDragEnd()
      try {
        e.target.releasePointerCapture(e.pointerId)
      } catch (_) {}
    }
  }

  return (
    <group position={point}>
      {/* Invisible larger touch/click target for easy interaction */}
      <mesh
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "grab"
        }}
        onPointerOut={() => {
          setHovered(false)
          if (!isDragging.current) document.body.style.cursor = "auto"
        }}
      >
        <sphereGeometry args={[0.9, 12, 12]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Visible Visual Node */}
      <mesh>
        <sphereGeometry args={[isSelected ? 0.65 : hovered ? 0.5 : 0.38, 16, 16]} />
        <meshStandardMaterial
          color={
            isRouteDisabled
              ? isSelected ? "#f87171" : "#64748b"
              : isSelected ? "#d08a63" : hovered ? "#e1c1af" : routeColor
          }
          emissive={
            isRouteDisabled
              ? isSelected ? "#ef4444" : "#475569"
              : isSelected ? "#87482d" : hovered ? "#c57950" : routeColor
          }
          emissiveIntensity={isRouteDisabled ? (isSelected ? 0.6 : 0.2) : isSelected ? 1.2 : hovered ? 0.8 : 0.4}
          roughness={0.3}
          metalness={0.1}
          transparent={isRouteDisabled}
          opacity={isRouteDisabled ? 0.6 : 1.0}
        />
      </mesh>

      {/* Point Index Tag for Selected/Hovered */}
      {(isSelected || hovered) && (
        <Html position={[0, 0.9, 0]} center pointerEvents="none">
          <div className={`text-[11px] font-mono px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap select-none backdrop-blur border ${
            isRouteDisabled
              ? "bg-red-950/90 text-red-200 border-red-500/50"
              : "bg-[#211E1C]/95 text-white border-primary/50"
          }`}>
            #{index} {isRouteDisabled ? "(Path Disabled)" : `(${point[0].toFixed(1)}, ${point[2].toFixed(1)})`}
          </div>
        </Html>
      )}

      {/* Selected Pulse Ring on Ground */}
      {isSelected && (
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.05, 32]} />
          <meshBasicMaterial
            color={isRouteDisabled ? "#bd4b3e" : "#d08a63"}
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  )
}

export function WaypointEditor({
  waypoints,
  disabledRoutes = [],
  onChangeWaypoints,
  activeRouteId,
  selectedWaypointIndex,
  onSelectWaypoint,
  isDraggingRef,
  onDraggingChange,
  visible,
}: WaypointEditorProps) {
  const transformRef = useRef<any>(null)
  const anchorRef = useRef<THREE.Group>(null)

  // Generate all routes (including disabled so editor can display them)
  const routes = useMemo(() => {
    return generateTrafficRoutes(waypoints)
  }, [waypoints])

  const activeRoute = useMemo(() => {
    return routes.find((r) => r.id === activeRouteId) || routes[0]
  }, [routes, activeRouteId])

  const isRouteDisabled = useMemo(() => {
    return disabledRoutes.includes(activeRouteId)
  }, [disabledRoutes, activeRouteId])

  const activePoints = useMemo(() => {
    if (!activeRoute) return []
    return waypoints[activeRoute.id] || activeRoute.points.map((p) => [p.x, p.y, p.z] as [number, number, number])
  }, [activeRoute, waypoints])

  // Sync transform anchor to selected waypoint position
  useEffect(() => {
    if (
      selectedWaypointIndex !== null &&
      activePoints[selectedWaypointIndex] &&
      anchorRef.current
    ) {
      const pt = activePoints[selectedWaypointIndex]
      anchorRef.current.position.set(pt[0], 0.05, pt[2])
    }
  }, [selectedWaypointIndex, activePoints])

  // Bind TransformControls dragging-changed event
  useEffect(() => {
    const controls = transformRef.current
    if (!controls) return

    const handleDraggingChanged = (event: any) => {
      const dragging = !!event.value
      isDraggingRef.current = dragging
      if (onDraggingChange) onDraggingChange(dragging)
    }

    controls.addEventListener("dragging-changed", handleDraggingChanged)
    return () => {
      controls.removeEventListener("dragging-changed", handleDraggingChanged)
    }
  }, [selectedWaypointIndex, isDraggingRef, onDraggingChange])

  // Direct Node Drag Update
  const handleNodeDragMove = useCallback(
    (index: number, newPos: [number, number, number]) => {
      const routeId = activeRoute?.id
      if (!routeId) return

      const currentList = [...activePoints]
      currentList[index] = newPos

      onChangeWaypoints({
        ...waypoints,
        [routeId]: currentList,
      })
    },
    [activeRoute?.id, activePoints, waypoints, onChangeWaypoints]
  )

  // Transform Gizmo Object Change Handler
  const handleGizmoObjectChange = useCallback(() => {
    if (!anchorRef.current || selectedWaypointIndex === null) return
    const pos = anchorRef.current.position
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
  }, [anchorRef, selectedWaypointIndex, activeRoute?.id, activePoints, waypoints, onChangeWaypoints])

  if (!visible) return null

  return (
    <group name="WaypointEditor">
      {/* 1. All Route Lines */}
      {routes.map((r) => {
        const isActive = r.id === activeRoute?.id
        const isThisRouteDisabled = disabledRoutes.includes(r.id)
        const linePoints = r.curve.getPoints(120)
        const geometry = new THREE.BufferGeometry().setFromPoints(linePoints)

        return (
          <group key={r.id}>
            <primitive
              object={
                new THREE.Line(
                  geometry,
                  new THREE.LineBasicMaterial({
                    color: isThisRouteDisabled ? "#64748b" : r.color,
                    linewidth: isActive ? 4 : 2,
                    transparent: true,
                    opacity: isThisRouteDisabled ? 0.25 : isActive ? 1.0 : 0.35,
                  })
                )
              }
            />
          </group>
        )
      })}

      {/* 2. Interactive Waypoint Nodes for Active Route */}
      {activeRoute &&
        activePoints.map((pt, idx) => {
          const isSelected = selectedWaypointIndex === idx
          return (
            <InteractiveWaypointNode
              key={`wp-${idx}`}
              point={pt}
              index={idx}
              isSelected={isSelected}
              isRouteDisabled={isRouteDisabled}
              routeColor={activeRoute.color}
              onSelect={() => onSelectWaypoint(idx)}
              onDragStart={() => {
                isDraggingRef.current = true
                if (onDraggingChange) onDraggingChange(true)
              }}
              onDragMove={(newPos) => handleNodeDragMove(idx, newPos)}
              onDragEnd={() => {
                isDraggingRef.current = false
                if (onDraggingChange) onDraggingChange(false)
                document.body.style.cursor = "auto"
              }}
            />
          )
        })}

      {/* 3. Precision Transform Gizmo for Selected Waypoint */}
      {selectedWaypointIndex !== null && activePoints[selectedWaypointIndex] && (
        <>
          <group
            ref={anchorRef}
            position={[
              activePoints[selectedWaypointIndex][0],
              0.05,
              activePoints[selectedWaypointIndex][2],
            ]}
          />

          <TransformControls
            ref={transformRef}
            object={anchorRef as any}
            mode="translate"
            showY={false} // Locked to X-Z ground plane
            showX={true}
            showZ={true}
            size={0.8}
            onObjectChange={handleGizmoObjectChange}
          />
        </>
      )}
    </group>
  )
}
