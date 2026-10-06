"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Suspense, useState, useEffect } from "react"
import { CityEnvironment } from "./CityEnvironment"
import { Roads } from "./Roads"
import { Buildings } from "./Buildings"
import { Traffic } from "./Traffic"
import { CityLoadingScreen } from "./CityLoadingScreen"
import { getPublishedMapConfig } from "@/app/actions/mapEditor"
import { CityMapConfig, DEFAULT_BUILDINGS } from "@/components/map-editor/types"

export function CityScene() {
  const [mapConfig, setMapConfig] = useState<CityMapConfig | null>(null)
  const [isConfigLoaded, setIsConfigLoaded] = useState(false)

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

  return (
    <div className="fixed inset-0 w-full h-full z-0 bg-[#548bb9]">
      {/* Loading Screen Overlay */}
      <CityLoadingScreen isConfigLoaded={isConfigLoaded} />

      {/* Top Left Title */}
      <div className="absolute top-6 left-8 z-10 pointer-events-none select-none">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-slate-800/80 uppercase font-mono border-b-2 border-slate-700/40 pb-1">
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
            enableRotate={true}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 6}
            enableZoom={true} 
            enablePan={true}
            minDistance={20}
            maxDistance={120}
            panSpeed={1}
            zoomSpeed={1}
            target={[0, 0, 0]}
          />
          
          <CityEnvironment />
          <Roads />
          <Suspense fallback={null}>
            <Traffic
              showPathLines={false}
              routeOverrides={mapConfig?.waypoints}
            />
          </Suspense>
          {isConfigLoaded && (
            <Buildings buildings={mapConfig?.buildings || DEFAULT_BUILDINGS} />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}

