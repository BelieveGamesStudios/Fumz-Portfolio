"use client"

import React, { useRef, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import {
  OrbitControls,
  PerspectiveCamera,
  Grid,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei"
import { CityEnvironment } from "@/components/city/CityEnvironment"
import { Roads } from "@/components/city/Roads"
import { Traffic } from "@/components/city/Traffic"
import { BuildingEditor } from "./BuildingEditor"
import { WaypointEditor } from "./WaypointEditor"
import { PlacedBuilding, RouteWaypointMap } from "./types"

interface EditorViewportProps {
  editorMode: "buildings" | "waypoints"
  transformMode: "translate" | "rotate" | "scale"
  buildings: PlacedBuilding[]
  onChangeBuildings: (b: PlacedBuilding[]) => void
  selectedBuildingId: string | null
  onSelectBuilding: (id: string | null) => void
  waypoints: RouteWaypointMap
  disabledRoutes?: string[]
  onChangeWaypoints: (w: RouteWaypointMap) => void
  activeRouteId: string
  selectedWaypointIndex: number | null
  onSelectWaypoint: (idx: number | null) => void
  testDriveActive: boolean
  cameraPreset: "iso" | "top" | "front"
}

export function EditorViewport({
  editorMode,
  transformMode,
  buildings,
  onChangeBuildings,
  selectedBuildingId,
  onSelectBuilding,
  waypoints,
  disabledRoutes = [],
  onChangeWaypoints,
  activeRouteId,
  selectedWaypointIndex,
  onSelectWaypoint,
  testDriveActive,
  cameraPreset,
}: EditorViewportProps) {
  const isDraggingRef = useRef(false)
  const [isDraggingState, setIsDraggingState] = useState(false)
  const orbitRef = useRef<any>(null)

  // Move camera based on cameraPreset
  useEffect(() => {
    if (!orbitRef.current) return
    const controls = orbitRef.current
    const camera = controls.object

    if (cameraPreset === "top") {
      camera.position.set(0, 100, 0.01)
      controls.target.set(0, 0, 0)
    } else if (cameraPreset === "front") {
      camera.position.set(0, 20, 70)
      controls.target.set(0, 0, 0)
    } else {
      // iso
      camera.position.set(45, 55, 55)
      controls.target.set(0, 0, 0)
    }
    controls.update()
  }, [cameraPreset])

  const handleDraggingChange = (dragging: boolean) => {
    isDraggingRef.current = dragging
    setIsDraggingState(dragging)
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden bg-slate-950 border border-border shadow-2xl select-none">
      <Canvas
        shadows
        onPointerMissed={() => {
          if (!isDraggingRef.current && !isDraggingState) {
            onSelectBuilding(null)
            onSelectWaypoint(null)
          }
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={[45, 55, 55]}
          fov={42}
          near={1}
          far={1000}
        />

        <OrbitControls
          ref={orbitRef}
          makeDefault
          enabled={!isDraggingState}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={10}
          maxDistance={180}
          target={[0, 0, 0]}
        />

        <CityEnvironment />

        {/* Ground Reference Grid */}
        <Grid
          position={[0, 0.01, 0]}
          args={[120, 120]}
          cellSize={2}
          cellThickness={0.6}
          cellColor="#334155"
          sectionSize={10}
          sectionThickness={1.2}
          sectionColor="#475569"
          fadeDistance={140}
          infiniteGrid
        />

        {/* Existing Road Network */}
        <Roads />

        {/* 1. Buildings Layer */}
        <BuildingEditor
          buildings={buildings}
          onChangeBuildings={onChangeBuildings}
          selectedBuildingId={selectedBuildingId}
          onSelectBuilding={onSelectBuilding}
          transformMode={transformMode}
          isDraggingRef={isDraggingRef}
          onDraggingChange={handleDraggingChange}
          visible={editorMode === "buildings"}
        />

        {/* 2. Waypoints Layer */}
        <WaypointEditor
          waypoints={waypoints}
          disabledRoutes={disabledRoutes}
          onChangeWaypoints={onChangeWaypoints}
          activeRouteId={activeRouteId}
          selectedWaypointIndex={selectedWaypointIndex}
          onSelectWaypoint={onSelectWaypoint}
          isDraggingRef={isDraggingRef}
          onDraggingChange={handleDraggingChange}
          visible={editorMode === "waypoints"}
        />

        {/* 3. Live Test Drive Simulation */}
        {testDriveActive && (
          <Traffic
            showPathLines={false}
            routeOverrides={waypoints}
            disabledRoutes={disabledRoutes}
          />
        )}

        {/* Viewport Orientation Gizmo */}
        <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
          <GizmoViewport
            axisColors={["#ef4444", "#22c55e", "#3b82f6"]}
            labelColor="#ffffff"
          />
        </GizmoHelper>
      </Canvas>

      {/* Mode Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2">
        <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900/80 backdrop-blur border border-white/20 text-white flex items-center gap-1.5 shadow-lg">
          <span className={`w-2 h-2 rounded-full ${editorMode === "buildings" ? "bg-cyan-400" : "bg-amber-400"}`} />
          {editorMode === "buildings" ? "BUILDINGS MODE" : "WAYPOINTS GIZMO MODE"}
        </span>

        {testDriveActive && (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
            🚗 TEST DRIVE ACTIVE
          </span>
        )}
      </div>

      {/* Quick Viewport Navigation Hints */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none text-[11px] text-slate-400 bg-slate-900/70 backdrop-blur px-2.5 py-1 rounded border border-white/10 hidden sm:block">
        {editorMode === "waypoints"
          ? "Click & Drag any node to move • Red/Blue Gizmo for axis precision"
          : "Left Click + Drag: Orbit • Right Click: Pan • Scroll: Zoom"}
      </div>
    </div>
  )
}
