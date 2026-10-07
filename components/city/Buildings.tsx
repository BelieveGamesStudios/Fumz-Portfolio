"use client"

import React, { Suspense, useState, useRef, useMemo } from "react"
import { Gltf, Html, useFBX } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import * as THREE from "three"
import { OBJLoader } from "three-stdlib"
import {
  PlacedBuilding,
  DEFAULT_BUILDINGS,
  normalizeBuildingInteraction,
  ModelFormat,
} from "@/components/map-editor/types"
import { Sparkles, FolderGit2, User, Briefcase, Layers, Award, Mail, ExternalLink } from "lucide-react"

interface BuildingsProps {
  buildings?: PlacedBuilding[]
  selectedBuildingId?: string | null
  onSelectBuilding?: (id: string, e: any) => void
  interactive?: boolean
  showHoverBadges?: boolean
}

const SECTION_ICON_MAP: Record<string, React.ReactNode> = {
  projects: <FolderGit2 className="w-3.5 h-3.5 text-accent" />,
  about: <User className="w-3.5 h-3.5 text-[#D5A68C]" />,
  experience: <Briefcase className="w-3.5 h-3.5 text-[#C57852]" />,
  skills: <Layers className="w-3.5 h-3.5 text-[#E1C1AF]" />,
  certifications: <Award className="w-3.5 h-3.5 text-[#B96843]" />,
  contact: <Mail className="w-3.5 h-3.5 text-[#D99A77]" />,
  custom: <ExternalLink className="w-3.5 h-3.5 text-accent" />,
}

function BuildingFloatingBadge({
  building,
  height,
}: {
  building: PlacedBuilding
  height: number
}) {
  const interaction = normalizeBuildingInteraction(building)
  const isInteractive = interaction.type !== "none"
  const labelText = building.label || building.name
  const icon = isInteractive ? SECTION_ICON_MAP[interaction.type] || <Sparkles className="w-3.5 h-3.5 text-primary" /> : null

  return (
    <Html
      position={[0, height + 1.8, 0]}
      center
      distanceFactor={45}
      zIndexRange={[100, 0]}
      className="pointer-events-none select-none transition-all duration-300"
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in-90 duration-200">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#18191A]/90 text-[#F3EBE6] border border-[#87482D]/70 backdrop-blur-md shadow-xl text-xs font-medium whitespace-nowrap">
          {icon}
          <span className="font-mono uppercase tracking-wider text-[11px]">
            {labelText}
          </span>
        </div>
        <div className="w-0.5 h-2 bg-[#87482D]/80" />
      </div>
    </Html>
  )
}

function FbxModel({ url }: { url: string }) {
  const fbx = useFBX(url)
  const scene = useMemo(() => {
    const clone = fbx.clone(true)
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [fbx])

  return <primitive object={scene} />
}

function ObjModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url)
  const scene = useMemo(() => {
    const clone = obj.clone(true)
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (!child.material || (Array.isArray(child.material) && child.material.length === 0)) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x8892b0,
            roughness: 0.4,
            metalness: 0.2,
          })
        }
      }
    })
    return clone
  }, [obj])

  return <primitive object={scene} />
}

function Render3DModel({ url, format }: { url: string; format?: ModelFormat }) {
  const cleanUrl = url.split("?")[0].split("#")[0]
  const detectedExt = (format || cleanUrl.split(".").pop() || "glb").toLowerCase()

  if (detectedExt === "fbx") {
    return <FbxModel url={url} />
  }
  if (detectedExt === "obj") {
    return <ObjModel url={url} />
  }
  return <Gltf src={url} castShadow receiveShadow />
}

function CustomBuilding({
  building,
  isSelected,
  onClick,
  isInteractive,
  showHoverBadges,
}: {
  building: PlacedBuilding
  isSelected: boolean
  onClick?: (e: any) => void
  isInteractive: boolean
  showHoverBadges: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const modelUrl = building.model_url || building.glb_url

  if (!modelUrl) return null

  const handlePointerDown = (e: any) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: any) => {
    const dx = Math.abs(e.clientX - pointerDownPos.current.x)
    const dy = Math.abs(e.clientY - pointerDownPos.current.y)
    // If movement was less than 5px, treat as clean click (not orbit drag)
    if (dx < 5 && dy < 5 && onClick) {
      onClick(e)
    }
  }

  const sY = Math.max(0.0001, building.scale[1] || 1)
  const badgeHeight = Math.max(3, sY >= 1 ? sY + 1 : 4)

  return (
    <group
      position={building.position}
      rotation={building.rotation}
      onPointerOver={(e) => {
        if (isInteractive) {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = "auto"
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <group scale={building.scale}>
        <Suspense
          fallback={
            <mesh position={[0, 2, 0]}>
              <boxGeometry args={[2, 4, 2]} />
              <meshStandardMaterial color="#76645b" wireframe />
            </mesh>
          }
        >
          <Render3DModel url={modelUrl} format={building.model_format} />
        </Suspense>
      </group>

      {/* Hover Floating Label */}
      {showHoverBadges && isInteractive && (hovered || isSelected) && (
        <BuildingFloatingBadge building={building} height={badgeHeight} />
      )}

      {/* Visual selection outline/ring indicator */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3, 3.4, 32]} />
          <meshBasicMaterial color="#b96843" />
        </mesh>
      )}

      {/* Subtle hover ground glow */}
      {hovered && !isSelected && isInteractive && (
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 3.1, 32]} />
          <meshBasicMaterial color="#d08a63" transparent opacity={0.55} />
        </mesh>
      )}
    </group>
  )
}

function BoxBuilding({
  building,
  isSelected,
  onClick,
  isInteractive,
  showHoverBadges,
}: {
  building: PlacedBuilding
  isSelected: boolean
  onClick?: (e: any) => void
  isInteractive: boolean
  showHoverBadges: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const [w, h, d] = building.scale
  const color = building.color || (building.type === "portfolio" ? "#a85c3a" : "#76645b")

  const handlePointerDown = (e: any) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = (e: any) => {
    const dx = Math.abs(e.clientX - pointerDownPos.current.x)
    const dy = Math.abs(e.clientY - pointerDownPos.current.y)
    // If movement was less than 5px, treat as clean click (not orbit drag)
    if (dx < 5 && dy < 5 && onClick) {
      onClick(e)
    }
  }

  return (
    <group
      position={building.position}
      rotation={building.rotation}
      onPointerOver={(e) => {
        if (isInteractive) {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = "auto"
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.1}
          emissive={isSelected ? "#b96843" : hovered && isInteractive ? "#b96843" : "#000000"}
          emissiveIntensity={isSelected ? 0.45 : hovered && isInteractive ? 0.25 : 0}
        />
      </mesh>

      {/* Hover Floating Label Badge */}
      {showHoverBadges && isInteractive && (hovered || isSelected) && (
        <BuildingFloatingBadge building={building} height={h} />
      )}

      {/* Selected highlight ring on ground */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) * 0.7, Math.max(w, d) * 0.7 + 0.4, 32]} />
          <meshBasicMaterial color="#b96843" />
        </mesh>
      )}

      {/* Subtle hover highlight ring on ground */}
      {hovered && !isSelected && isInteractive && (
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) * 0.68, Math.max(w, d) * 0.68 + 0.25, 32]} />
          <meshBasicMaterial color="#d08a63" transparent opacity={0.6} />
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
  showHoverBadges = true,
}: BuildingsProps) {
  const list = buildings && buildings.length > 0 ? buildings : DEFAULT_BUILDINGS

  return (
    <group name="CityBuildings">
      {list.map((building) => {
        const isSelected = selectedBuildingId === building.id
        const interaction = normalizeBuildingInteraction(building)
        const isInteractive = interactive && interaction.type !== "none"

        const handleClick = (e: any) => {
          if (interactive && onSelectBuilding) {
            e.stopPropagation?.()
            onSelectBuilding(building.id, e)
          }
        }

        const isCustomModel =
          building.type === "glb" ||
          building.type === "model" ||
          !!building.glb_url ||
          !!building.model_url

        if (isCustomModel && (building.glb_url || building.model_url)) {
          return (
            <CustomBuilding
              key={building.id}
              building={building}
              isSelected={isSelected}
              onClick={handleClick}
              isInteractive={isInteractive}
              showHoverBadges={showHoverBadges}
            />
          )
        }

        return (
          <BoxBuilding
            key={building.id}
            building={building}
            isSelected={isSelected}
            onClick={handleClick}
            isInteractive={isInteractive}
            showHoverBadges={showHoverBadges}
          />
        )
      })}
    </group>
  )
}
