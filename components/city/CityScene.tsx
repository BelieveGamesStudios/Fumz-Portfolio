"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Suspense, useState, useEffect, useRef, useCallback } from "react"
import { CityEnvironment } from "./CityEnvironment"
import { Roads } from "./Roads"
import { Buildings } from "./Buildings"
import { Traffic } from "./Traffic"
import { CityLoadingScreen } from "./CityLoadingScreen"
import { CityCameraRig } from "./CityCameraRig"
import { BuildingModalOverlay } from "./BuildingModalOverlay"
import { getPublishedMapConfig } from "@/app/actions/mapEditor"
import {
  CityMapConfig,
  DEFAULT_BUILDINGS,
  PlacedBuilding,
  normalizeBuildingInteraction,
} from "@/components/map-editor/types"

export function CityScene() {
  const [mapConfig, setMapConfig] = useState<CityMapConfig | null>(null)
  const [isConfigLoaded, setIsConfigLoaded] = useState(false)
  const [selectedBuilding, setSelectedBuilding] = useState<PlacedBuilding | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const controlsRef = useRef<any>(null)

  const buildingsList = mapConfig?.buildings && mapConfig.buildings.length > 0
    ? mapConfig.buildings
    : DEFAULT_BUILDINGS

  // Load published map config from DB
  useEffect(() => {
    let isMounted = true
    getPublishedMapConfig()
      .then((cfg) => {
        if (isMounted) {
          if (cfg) {
            setMapConfig(cfg)
          }
          setIsConfigLoaded(true)
        }
      })
      .catch((err) => {
        console.error("Failed to load map config:", err)
        if (isMounted) {
          setIsConfigLoaded(true)
        }
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Helper to open a building modal and update URL hash
  const activateBuilding = useCallback((building: PlacedBuilding) => {
    const interaction = normalizeBuildingInteraction(building)
    if (interaction.type === "none") return

    setSelectedBuilding(building)
    setIsModalOpen(true)

    // Update URL hash without forcing scroll
    const hash = interaction.type === "custom"
      ? `#building-${building.id}`
      : `#${interaction.type}`
    
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash)
    }
  }, [])

  // Helper to close modal and deterministically restore
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedBuilding(null)

    // Clean hash from URL
    if (window.location.hash) {
      window.history.pushState(null, "", window.location.pathname + window.location.search)
    }
  }, [])

  // Find building by section type or ID
  const findBuildingBySection = useCallback(
    (target: string): PlacedBuilding | undefined => {
      const clean = target.replace(/^#/, "").toLowerCase()
      if (!clean) return undefined

      // Check ID first
      const byId = buildingsList.find((b) => b.id.toLowerCase() === clean || `building-${b.id.toLowerCase()}` === clean)
      if (byId) return byId

      // Check interaction section type
      const bySection = buildingsList.find((b) => {
        const inter = normalizeBuildingInteraction(b)
        return inter.type.toLowerCase() === clean
      })
      if (bySection) return bySection

      // Check name or label match
      return buildingsList.find((b) =>
        (b.name && b.name.toLowerCase().includes(clean)) ||
        (b.label && b.label.toLowerCase().includes(clean))
      )
    },
    [buildingsList]
  )

  // Handle URL hash changes & deep links
  useEffect(() => {
    if (!isConfigLoaded) return

    const handleHashChange = () => {
      const hash = window.location.hash
      if (!hash || hash === "#") {
        setIsModalOpen(false)
        setSelectedBuilding(null)
        return
      }

      const match = findBuildingBySection(hash)
      if (match) {
        setSelectedBuilding(match)
        setIsModalOpen(true)
      }
    }

    // Initial check on load
    handleHashChange()

    window.addEventListener("hashchange", handleHashChange)
    window.addEventListener("popstate", handleHashChange)
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
      window.removeEventListener("popstate", handleHashChange)
    }
  }, [isConfigLoaded, findBuildingBySection])

  // Listen to custom navbar navigation event
  useEffect(() => {
    const handleNavEvent = (e: CustomEvent<{ section: string }>) => {
      const section = e.detail?.section
      if (!section) return
      const match = findBuildingBySection(section)
      if (match) {
        activateBuilding(match)
      }
    }

    window.addEventListener("portfolio-navigate" as any, handleNavEvent as any)
    return () => {
      window.removeEventListener("portfolio-navigate" as any, handleNavEvent as any)
    }
  }, [findBuildingBySection, activateBuilding])

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#C7AA98]">
      {/* Loading Screen Overlay */}
      <CityLoadingScreen isConfigLoaded={isConfigLoaded} />

      {/* Top Left Title */}
      <div className="absolute top-6 left-8 z-10 pointer-events-none select-none">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-[#2A211D]/85 uppercase font-mono border-b-2 border-[#87482D]/50 pb-1 drop-shadow-sm">
          BELIEVE PORTFOLIO CITY
        </h1>
      </div>

      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera 
            makeDefault 
            position={[0, 62, 50]} 
            fov={38}
            near={1}
            far={1000}
          />
          <OrbitControls 
            ref={controlsRef}
            makeDefault
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 6}
            enableZoom={true} 
            enablePan={true}
            minDistance={20}
            maxDistance={120}
            panSpeed={1}
            zoomSpeed={1}
          />
          
          {/* Smooth Camera Rig Controller */}
          <CityCameraRig
            targetBuilding={selectedBuilding}
            isModalOpen={isModalOpen}
            controlsRef={controlsRef}
          />

          <CityEnvironment />
          <Roads />
          <Suspense fallback={null}>
            <Traffic
              showPathLines={false}
              routeOverrides={mapConfig?.waypoints}
              disabledRoutes={mapConfig?.disabled_routes}
            />
          </Suspense>
          
          {isConfigLoaded && (
            <Buildings
              buildings={buildingsList}
              selectedBuildingId={selectedBuilding?.id || null}
              interactive={!isModalOpen}
              onSelectBuilding={(id) => {
                const b = buildingsList.find((item) => item.id === id)
                if (b) activateBuilding(b)
              }}
              showHoverBadges={!isModalOpen}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Production Building Modal Overlay */}
      <BuildingModalOverlay
        building={selectedBuilding}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
