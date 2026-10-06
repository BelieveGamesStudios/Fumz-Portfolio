"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Move,
  RotateCw,
  Maximize2,
  Building,
  Route,
  Camera,
  Play,
  Square,
  Save,
  Globe,
  RotateCcw,
} from "lucide-react"

interface ToolbarProps {
  editorMode: "buildings" | "waypoints"
  onSetEditorMode: (mode: "buildings" | "waypoints") => void
  transformMode: "translate" | "rotate" | "scale"
  onSetTransformMode: (mode: "translate" | "rotate" | "scale") => void
  cameraPreset: "iso" | "top" | "front"
  onSetCameraPreset: (preset: "iso" | "top" | "front") => void
  testDriveActive: boolean
  onToggleTestDrive: () => void
  activeRouteId: string
  onSelectRouteId: (routeId: string) => void
  onSaveDraft: () => void
  onPublish: () => void
  isSaving: boolean
  isPublishing: boolean
  hasUnsavedChanges: boolean
  publishedAt?: string | null
}

const ROUTES = [
  { id: "route-clockwise-outer", name: "Outer Clockwise (Inner Lane)", color: "#22c55e" },
  { id: "route-counter-clockwise-outer", name: "Outer Counter-Clockwise (Outer Lane)", color: "#06b6d4" },
  { id: "route-north-south-artery", name: "North-South Boulevard (Two-Way)", color: "#f59e0b" },
  { id: "route-east-west-artery", name: "East-West Boulevard (Two-Way)", color: "#ec4899" },
  { id: "route-roundabout-loop", name: "Central Roundabout Cruise", color: "#eab308" },
]

export function Toolbar({
  editorMode,
  onSetEditorMode,
  transformMode,
  onSetTransformMode,
  cameraPreset,
  onSetCameraPreset,
  testDriveActive,
  onToggleTestDrive,
  activeRouteId,
  onSelectRouteId,
  onSaveDraft,
  onPublish,
  isSaving,
  isPublishing,
  hasUnsavedChanges,
  publishedAt,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card/80 backdrop-blur-md border border-border rounded-xl shadow-lg">
      {/* 1. Main Mode Selector */}
      <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg">
        <Button
          size="sm"
          variant={editorMode === "buildings" ? "default" : "ghost"}
          className="h-8 text-xs gap-1.5 cursor-pointer"
          onClick={() => onSetEditorMode("buildings")}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Buildings</span>
        </Button>

        <Button
          size="sm"
          variant={editorMode === "waypoints" ? "default" : "ghost"}
          className="h-8 text-xs gap-1.5 cursor-pointer"
          onClick={() => onSetEditorMode("waypoints")}
        >
          <Route className="w-3.5 h-3.5" />
          <span>Waypoints Gizmo</span>
        </Button>
      </div>

      {/* 2. Sub-tools based on Active Mode */}
      {editorMode === "buildings" ? (
        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg">
          <Button
            size="sm"
            variant={transformMode === "translate" ? "secondary" : "ghost"}
            className="h-7 text-xs px-2.5 gap-1 cursor-pointer"
            onClick={() => onSetTransformMode("translate")}
            title="Translate (Move)"
          >
            <Move className="w-3 h-3" />
            <span>Move</span>
          </Button>

          <Button
            size="sm"
            variant={transformMode === "rotate" ? "secondary" : "ghost"}
            className="h-7 text-xs px-2.5 gap-1 cursor-pointer"
            onClick={() => onSetTransformMode("rotate")}
            title="Rotate"
          >
            <RotateCw className="w-3 h-3" />
            <span>Rotate</span>
          </Button>

          <Button
            size="sm"
            variant={transformMode === "scale" ? "secondary" : "ghost"}
            className="h-7 text-xs px-2.5 gap-1 cursor-pointer"
            onClick={() => onSetTransformMode("scale")}
            title="Scale"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Scale</span>
          </Button>
        </div>
      ) : (
        /* Route Selector when in Waypoints Mode */
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[420px] py-0.5">
          {ROUTES.map((r) => {
            const isSelected = activeRouteId === r.id
            return (
              <button
                key={r.id}
                onClick={() => onSelectRouteId(r.id)}
                className={`px-2.5 py-1 text-xs rounded-md border flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: r.color }}
                />
                <span className="truncate max-w-[120px]">{r.name.split(" ")[0]}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* 3. Camera Presets & Test Drive Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg">
          <Button
            size="sm"
            variant={cameraPreset === "iso" ? "secondary" : "ghost"}
            className="h-7 text-xs px-2 cursor-pointer"
            onClick={() => onSetCameraPreset("iso")}
            title="Isometric Camera"
          >
            Iso
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === "top" ? "secondary" : "ghost"}
            className="h-7 text-xs px-2 cursor-pointer"
            onClick={() => onSetCameraPreset("top")}
            title="Top Down 2D Camera"
          >
            Top
          </Button>
          <Button
            size="sm"
            variant={cameraPreset === "front" ? "secondary" : "ghost"}
            className="h-7 text-xs px-2 cursor-pointer"
            onClick={() => onSetCameraPreset("front")}
            title="Front Ground Camera"
          >
            Front
          </Button>
        </div>

        <Button
          size="sm"
          variant={testDriveActive ? "destructive" : "outline"}
          className="h-8 text-xs gap-1.5 cursor-pointer"
          onClick={onToggleTestDrive}
        >
          {testDriveActive ? (
            <>
              <Square className="w-3.5 h-3.5" />
              <span>Stop Drive</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Drive</span>
            </>
          )}
        </Button>
      </div>

      {/* 4. Save Draft & Publish Live Actions */}
      <div className="flex items-center gap-2">
        {publishedAt && (
          <span className="text-[10px] text-muted-foreground hidden xl:inline">
            Live: {new Date(publishedAt).toLocaleDateString()}
          </span>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1.5 cursor-pointer"
          onClick={onSaveDraft}
          disabled={isSaving}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Saving..." : "Save Draft"}</span>
        </Button>

        <Button
          size="sm"
          className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer"
          onClick={onPublish}
          disabled={isPublishing}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{isPublishing ? "Publishing..." : "Publish Map"}</span>
        </Button>
      </div>
    </div>
  )
}
