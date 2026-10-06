"use client"

import React, { Suspense } from "react"
import { Gltf } from "@react-three/drei"
import { PlacedBuilding, DEFAULT_BUILDINGS } from "@/components/map-editor/types"

interface BuildingsProps {
  buildings?: PlacedBuilding[]
  selectedBuildingId?: string | null
  onSelectBuilding?: (id: string, e: any) => void
  interactive?: boolean
}

function GlbBuilding({
  building,
  isSelected,
  onClick,
}: {
  building: PlacedBuilding
  isSelected: boolean
  onClick?: (e: any) => void
}) {
  if (!building.glb_url) return null

  return (
    <group
      position={building.position}
      rotation={building.rotation}
      scale={building.scale}
      onClick={onClick}
    >
      <Suspense fallback={
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[2, 4, 2]} />
          <meshStandardMaterial color="#64748b" wireframe />
        </mesh>
      }>
        <Gltf src={building.glb_url} castShadow receiveShadow />
      </Suspense>

      {/* Visual selection outline/ring indicator */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3, 3.4, 32]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      )}
    </group>
  )
}

function BoxBuilding({
  building,
  isSelected,
  onClick,
}: {
  building: PlacedBuilding
  isSelected: boolean
  onClick?: (e: any) => void
}) {
  const [w, h, d] = building.scale
  const color = building.color || (building.type === 'portfolio' ? '#38bdf8' : '#718096')

  return (
    <group
      position={building.position}
      rotation={building.rotation}
      onClick={onClick}
    >
      <mesh
        castShadow
        receiveShadow
        position={[0, h / 2, 0]}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
          emissive={isSelected ? '#38bdf8' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>

      {/* Selected highlight ring on ground */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) * 0.7, Math.max(w, d) * 0.7 + 0.4, 32]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      )}
    </group>
  )
}

export function Buildings({
  buildings = DEFAULT_BUILDINGS,
  selectedBuildingId = null,
  onSelectBuilding,
  interactive = false,
}: BuildingsProps) {
  const list = buildings && buildings.length > 0 ? buildings : DEFAULT_BUILDINGS

  return (
    <group name="CityBuildings">
      {list.map((building) => {
        const isSelected = selectedBuildingId === building.id

        const handleClick = (e: any) => {
          if (interactive && onSelectBuilding) {
            e.stopPropagation()
            onSelectBuilding(building.id, e)
          }
        }

        if (building.type === 'glb' && building.glb_url) {
          return (
            <GlbBuilding
              key={building.id}
              building={building}
              isSelected={isSelected}
              onClick={handleClick}
            />
          )
        }

        return (
          <BoxBuilding
            key={building.id}
            building={building}
            isSelected={isSelected}
            onClick={handleClick}
          />
        )
      })}
    </group>
  )
}
