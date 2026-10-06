"use client"

import React, { useRef, useEffect, useCallback } from "react"
import * as THREE from "three"
import { TransformControls } from "@react-three/drei"
import { Buildings } from "@/components/city/Buildings"
import { PlacedBuilding } from "./types"

interface BuildingEditorProps {
  buildings: PlacedBuilding[]
  onChangeBuildings: (updated: PlacedBuilding[]) => void
  selectedBuildingId: string | null
  onSelectBuilding: (id: string | null) => void
  transformMode: "translate" | "rotate" | "scale"
  isDraggingRef: React.MutableRefObject<boolean>
  onDraggingChange?: (isDragging: boolean) => void
  visible: boolean
}

export function BuildingEditor({
  buildings,
  onChangeBuildings,
  selectedBuildingId,
  onSelectBuilding,
  transformMode,
  isDraggingRef,
  onDraggingChange,
  visible,
}: BuildingEditorProps) {
  const transformRef = useRef<any>(null)
  const anchorRef = useRef<THREE.Group>(null)

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId)

  // Sync transform anchor to selected building's position, rotation, and scale
  useEffect(() => {
    if (selectedBuilding && anchorRef.current) {
      anchorRef.current.position.set(
        selectedBuilding.position[0],
        selectedBuilding.position[1],
        selectedBuilding.position[2]
      )
      anchorRef.current.rotation.set(
        selectedBuilding.rotation[0],
        selectedBuilding.rotation[1],
        selectedBuilding.rotation[2]
      )
      anchorRef.current.scale.set(
        selectedBuilding.scale[0],
        selectedBuilding.scale[1],
        selectedBuilding.scale[2]
      )
    }
  }, [selectedBuildingId, selectedBuilding?.position, selectedBuilding?.rotation, selectedBuilding?.scale])

  // Attach dragging-changed listener
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
  }, [selectedBuildingId, isDraggingRef, onDraggingChange])

  const handleTransformObjectChange = useCallback(() => {
    if (!anchorRef.current || !selectedBuildingId) return
    const obj = anchorRef.current

    const updated = buildings.map((b) => {
      if (b.id !== selectedBuildingId) return b
      return {
        ...b,
        position: [
          Number(obj.position.x.toFixed(2)),
          Number(obj.position.y.toFixed(2)),
          Number(obj.position.z.toFixed(2)),
        ] as [number, number, number],
        rotation: [
          Number(obj.rotation.x.toFixed(3)),
          Number(obj.rotation.y.toFixed(3)),
          Number(obj.rotation.z.toFixed(3)),
        ] as [number, number, number],
        scale: [
          Number(Math.max(0.2, obj.scale.x).toFixed(2)),
          Number(Math.max(0.2, obj.scale.y).toFixed(2)),
          Number(Math.max(0.2, obj.scale.z).toFixed(2)),
        ] as [number, number, number],
      }
    })

    onChangeBuildings(updated)
  }, [buildings, selectedBuildingId, onChangeBuildings])

  return (
    <group name="BuildingEditor">
      {/* 1. All Buildings */}
      <Buildings
        buildings={buildings}
        selectedBuildingId={selectedBuildingId}
        onSelectBuilding={(id) => onSelectBuilding(id)}
        interactive={visible}
      />

      {/* 2. Transform Gizmo for Selected Building */}
      {visible && selectedBuilding && (
        <>
          <group
            ref={anchorRef}
            position={selectedBuilding.position}
            rotation={selectedBuilding.rotation}
            scale={selectedBuilding.scale}
          />

          <TransformControls
            ref={transformRef}
            object={anchorRef as any}
            mode={transformMode}
            size={0.8}
            onObjectChange={handleTransformObjectChange}
          />
        </>
      )}
    </group>
  )
}
