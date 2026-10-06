"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ExternalLink,
  PanelLeft,
  PanelRight,
} from "lucide-react"
import { Toolbar } from "./Toolbar"
import { AssetLibrary } from "./AssetLibrary"
import { EditorViewport } from "./EditorViewport"
import { Inspector } from "./Inspector"
import {
  PlacedBuilding,
  RouteWaypointMap,
  MapAsset,
  DEFAULT_BUILDINGS,
} from "./types"
import { getDefaultRouteWaypoints } from "@/components/city/trafficRoutes"
import {
  getDraftMapConfig,
  saveDraftMapConfig,
  publishMapConfig,
  getMapAssets,
  deleteMapAsset,
} from "@/app/actions/mapEditor"

interface MapEditorProps {
  fullScreen?: boolean
}

export function MapEditor({ fullScreen = false }: MapEditorProps) {
  const { toast } = useToast()

  // Scene state
  const [buildings, setBuildings] = useState<PlacedBuilding[]>(DEFAULT_BUILDINGS)
  const [waypoints, setWaypoints] = useState<RouteWaypointMap>({})
  const [assets, setAssets] = useState<MapAsset[]>([])

  // Editor UI state
  const [editorMode, setEditorMode] = useState<"buildings" | "waypoints">("buildings")
  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "scale">("translate")
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)
  const [activeRouteId, setActiveRouteId] = useState<string>("route-clockwise-outer")
  const [selectedWaypointIndex, setSelectedWaypointIndex] = useState<number | null>(null)
  const [cameraPreset, setCameraPreset] = useState<"iso" | "top" | "front">("iso")
  const [testDriveActive, setTestDriveActive] = useState<boolean>(false)

  // Panel collapse toggles for full view
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  // Status & persistence state
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [publishedAt, setPublishedAt] = useState<string | null>(null)

  // Load initial scene state (Draft or Published or defaults)
  useEffect(() => {
    let isMounted = true

    // Set default route waypoints initially
    const defaultWaypoints = getDefaultRouteWaypoints()
    setWaypoints(defaultWaypoints)

    // Load from DB
    getDraftMapConfig().then((cfg) => {
      if (!isMounted) return
      if (cfg) {
        if (cfg.buildings && cfg.buildings.length > 0) {
          setBuildings(cfg.buildings)
        }
        if (cfg.waypoints && Object.keys(cfg.waypoints).length > 0) {
          setWaypoints({ ...defaultWaypoints, ...cfg.waypoints })
        }
        if (cfg.published_at) {
          setPublishedAt(cfg.published_at)
        }
      } else {
        // Fallback to localStorage if any
        try {
          const cached = localStorage.getItem("fumz_city_draft")
          if (cached) {
            const parsed = JSON.parse(cached)
            if (parsed.buildings) setBuildings(parsed.buildings)
            if (parsed.waypoints) setWaypoints({ ...defaultWaypoints, ...parsed.waypoints })
          }
        } catch (e) {
          console.warn("Could not read local draft backup:", e)
        }
      }
    })

    // Load assets
    getMapAssets().then((list) => {
      if (isMounted && list) {
        setAssets(list)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing into an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (e.key === "w" || e.key === "W") {
        setTransformMode("translate")
      } else if (e.key === "e" || e.key === "E") {
        setTransformMode("rotate")
      } else if (e.key === "r" || e.key === "R") {
        setTransformMode("scale")
      } else if (e.key === "Escape") {
        setSelectedBuildingId(null)
        setSelectedWaypointIndex(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Building mutation handlers
  const handleUpdateBuilding = useCallback((updated: PlacedBuilding) => {
    setBuildings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setHasUnsavedChanges(true)
  }, [])

  const handleAddBuilding = useCallback((newB: PlacedBuilding) => {
    setBuildings((prev) => [...prev, newB])
    setSelectedBuildingId(newB.id)
    setHasUnsavedChanges(true)
    toast({
      title: "Building Added",
      description: `Added "${newB.name}" to the scene.`,
    })
  }, [toast])

  const handleDuplicateBuilding = useCallback((id: string) => {
    const target = buildings.find((b) => b.id === id)
    if (!target) return
    const duplicated: PlacedBuilding = {
      ...target,
      id: `${target.type}-${Date.now()}`,
      name: `${target.name} (Copy)`,
      position: [target.position[0] + 3, target.position[1], target.position[2] + 3],
    }
    setBuildings((prev) => [...prev, duplicated])
    setSelectedBuildingId(duplicated.id)
    setHasUnsavedChanges(true)
    toast({
      title: "Building Duplicated",
      description: `Created copy of "${target.name}".`,
    })
  }, [buildings, toast])

  const handleDeleteBuilding = useCallback((id: string) => {
    setBuildings((prev) => prev.filter((b) => b.id !== id))
    if (selectedBuildingId === id) setSelectedBuildingId(null)
    setHasUnsavedChanges(true)
  }, [selectedBuildingId])

  // Waypoint mutation handlers
  const handleUpdateWaypoints = useCallback((updated: RouteWaypointMap) => {
    setWaypoints(updated)
    setHasUnsavedChanges(true)
  }, [])

  const handleResetRoute = useCallback((routeId: string) => {
    const defaults = getDefaultRouteWaypoints()
    if (defaults[routeId]) {
      setWaypoints((prev) => ({
        ...prev,
        [routeId]: defaults[routeId],
      }))
      setSelectedWaypointIndex(null)
      setHasUnsavedChanges(true)
      toast({
        title: "Route Reset",
        description: "Restored route waypoints to original road centerline.",
      })
    }
  }, [toast])

  // Asset handlers
  const handleAssetUploaded = useCallback((newAsset: MapAsset) => {
    setAssets((prev) => [newAsset, ...prev])
    toast({
      title: "Model Uploaded",
      description: `"${newAsset.name}" is now ready in your asset library.`,
    })
  }, [toast])

  const handleDeleteAsset = useCallback(async (id: string) => {
    await deleteMapAsset(id)
    setAssets((prev) => prev.filter((a) => a.id !== id))
    toast({
      title: "Asset Removed",
      description: "Removed asset from library.",
    })
  }, [toast])

  // Save Draft handler
  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem(
        "fumz_city_draft",
        JSON.stringify({ buildings, waypoints, savedAt: new Date().toISOString() })
      )

      const res = await saveDraftMapConfig({ buildings, waypoints })
      if (res.success) {
        setHasUnsavedChanges(false)
        toast({
          title: "Draft Saved",
          description: "All building transforms and route waypoints have been saved as draft.",
        })
      } else {
        toast({
          title: "Saved Locally",
          description: res.error || "Draft saved to browser storage.",
          variant: "destructive",
        })
      }
    } catch (e: any) {
      toast({
        title: "Save Error",
        description: e.message || "Could not save draft.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Publish Live handler
  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const res = await publishMapConfig({ buildings, waypoints })
      if (res.success) {
        setPublishedAt(res.publishedAt || new Date().toISOString())
        setHasUnsavedChanges(false)
        toast({
          title: "City Map Published! 🚀",
          description: "Your custom buildings and traffic waypoints are now live on the homepage.",
        })
      } else {
        toast({
          title: "Publish Failed",
          description: res.error || "Could not publish map config.",
          variant: "destructive",
        })
      }
    } catch (e: any) {
      toast({
        title: "Publish Error",
        description: e.message || "Failed to publish.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const workspaceContent = (
    <div className={`flex gap-3 overflow-hidden ${fullScreen ? "flex-1 min-h-0 p-3" : "h-[700px] mt-4"}`}>
      {/* Left Panel: Asset Library & Hierarchy */}
      {leftPanelOpen && (
        <div className="w-80 h-full shrink-0">
          <AssetLibrary
            assets={assets}
            onAssetUploaded={handleAssetUploaded}
            onDeleteAsset={handleDeleteAsset}
            onAddBuilding={handleAddBuilding}
            placedBuildings={buildings}
            selectedBuildingId={selectedBuildingId}
            onSelectBuilding={(id) => {
              setSelectedBuildingId(id)
              setEditorMode("buildings")
            }}
            onDeleteBuilding={handleDeleteBuilding}
          />
        </div>
      )}

      {/* Center: 3D Viewport Editor */}
      <div className="flex-1 h-full min-w-0">
        <EditorViewport
          editorMode={editorMode}
          transformMode={transformMode}
          buildings={buildings}
          onChangeBuildings={(b) => {
            setBuildings(b)
            setHasUnsavedChanges(true)
          }}
          selectedBuildingId={selectedBuildingId}
          onSelectBuilding={setSelectedBuildingId}
          waypoints={waypoints}
          onChangeWaypoints={handleUpdateWaypoints}
          activeRouteId={activeRouteId}
          selectedWaypointIndex={selectedWaypointIndex}
          onSelectWaypoint={setSelectedWaypointIndex}
          testDriveActive={testDriveActive}
          cameraPreset={cameraPreset}
        />
      </div>

      {/* Right Panel: Transform & Waypoints Inspector */}
      {rightPanelOpen && (
        <div className="w-80 h-full shrink-0">
          <Inspector
            editorMode={editorMode}
            buildings={buildings}
            selectedBuildingId={selectedBuildingId}
            onUpdateBuilding={handleUpdateBuilding}
            onDuplicateBuilding={handleDuplicateBuilding}
            onDeleteBuilding={handleDeleteBuilding}
            waypoints={waypoints}
            activeRouteId={activeRouteId}
            selectedWaypointIndex={selectedWaypointIndex}
            onChangeWaypoints={handleUpdateWaypoints}
            onSelectWaypoint={setSelectedWaypointIndex}
            onResetRoute={handleResetRoute}
          />
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="w-full h-screen flex flex-col bg-slate-950 text-foreground overflow-hidden select-none">
        {/* Fullscreen Header Navigation */}
        <header className="h-14 border-b border-border/80 px-4 flex items-center justify-between bg-card/70 backdrop-blur shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs hover:bg-muted cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold tracking-wide uppercase font-mono">
                City Map Editor
              </h1>
              <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30">
                Full View
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 cursor-pointer"
              onClick={() => setLeftPanelOpen((p) => !p)}
              title="Toggle Asset Library & Hierarchy"
            >
              <PanelLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{leftPanelOpen ? "Hide Library" : "Show Library"}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 cursor-pointer"
              onClick={() => setRightPanelOpen((p) => !p)}
              title="Toggle Inspector"
            >
              <PanelRight className="w-4 h-4" />
              <span className="hidden sm:inline">{rightPanelOpen ? "Hide Inspector" : "Show Inspector"}</span>
            </Button>

            <Link href="/" target="_blank">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview Live</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Toolbar Bar */}
        <div className="px-3 pt-3 shrink-0">
          <Toolbar
            editorMode={editorMode}
            onSetEditorMode={setEditorMode}
            transformMode={transformMode}
            onSetTransformMode={setTransformMode}
            cameraPreset={cameraPreset}
            onSetCameraPreset={setCameraPreset}
            testDriveActive={testDriveActive}
            onToggleTestDrive={() => setTestDriveActive((prev) => !prev)}
            activeRouteId={activeRouteId}
            onSelectRouteId={(id) => {
              setActiveRouteId(id)
              setSelectedWaypointIndex(null)
            }}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            isSaving={isSaving}
            isPublishing={isPublishing}
            hasUnsavedChanges={hasUnsavedChanges}
            publishedAt={publishedAt}
          />
        </div>

        {/* 3-Column Workspace Filling 100% of remaining screen */}
        {workspaceContent}
      </div>
    )
  }

  // Embedded view fallback
  return (
    <div className="w-full space-y-4">
      <Toolbar
        editorMode={editorMode}
        onSetEditorMode={setEditorMode}
        transformMode={transformMode}
        onSetTransformMode={setTransformMode}
        cameraPreset={cameraPreset}
        onSetCameraPreset={setCameraPreset}
        testDriveActive={testDriveActive}
        onToggleTestDrive={() => setTestDriveActive((prev) => !prev)}
        activeRouteId={activeRouteId}
        onSelectRouteId={(id) => {
          setActiveRouteId(id)
          setSelectedWaypointIndex(null)
        }}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isSaving={isSaving}
        isPublishing={isPublishing}
        hasUnsavedChanges={hasUnsavedChanges}
        publishedAt={publishedAt}
      />
      {workspaceContent}
    </div>
  )
}
