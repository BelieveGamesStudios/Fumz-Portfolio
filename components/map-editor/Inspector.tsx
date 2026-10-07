"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Copy,
  Trash2,
  MapPin,
  Building,
  RotateCw,
  Maximize2,
  PlusCircle,
  RotateCcw,
  Sliders,
  Eye,
  EyeOff,
  Route as RouteIcon,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import {
  PlacedBuilding,
  RouteWaypointMap,
  BuildingModalType,
  normalizeBuildingInteraction,
  isValidSafeUrl,
} from "./types"

interface InspectorProps {
  editorMode: "buildings" | "waypoints"
  // Buildings inspection
  buildings: PlacedBuilding[]
  selectedBuildingId: string | null
  onUpdateBuilding: (updated: PlacedBuilding) => void
  onDuplicateBuilding: (id: string) => void
  onDeleteBuilding: (id: string) => void
  onPreviewBuilding?: (building: PlacedBuilding) => void
  // Waypoint inspection
  waypoints: RouteWaypointMap
  disabledRoutes?: string[]
  activeRouteId: string
  selectedWaypointIndex: number | null
  onChangeWaypoints: (updated: RouteWaypointMap) => void
  onSelectWaypoint: (idx: number | null) => void
  onToggleRouteDisabled?: (routeId: string) => void
  onResetRoute: (routeId: string) => void
  onResetAllRoutes?: () => void
}

export function Inspector({
  editorMode,
  buildings,
  selectedBuildingId,
  onUpdateBuilding,
  onDuplicateBuilding,
  onDeleteBuilding,
  onPreviewBuilding,
  waypoints,
  disabledRoutes = [],
  activeRouteId,
  selectedWaypointIndex,
  onChangeWaypoints,
  onSelectWaypoint,
  onToggleRouteDisabled,
  onResetRoute,
  onResetAllRoutes,
}: InspectorProps) {
  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId)
  const currentRoutePoints = waypoints[activeRouteId] || []
  const selectedWaypoint =
    selectedWaypointIndex !== null && currentRoutePoints[selectedWaypointIndex]
      ? currentRoutePoints[selectedWaypointIndex]
      : null

  const isRouteDisabled = disabledRoutes.includes(activeRouteId)

  // Helpers for Building transform inputs
  const handlePosChange = (axis: 0 | 1 | 2, val: number) => {
    if (!selectedBuilding) return
    const newPos = [...selectedBuilding.position] as [number, number, number]
    newPos[axis] = isNaN(val) ? 0 : val
    onUpdateBuilding({ ...selectedBuilding, position: newPos })
  }

  const handleRotChange = (axis: 0 | 1 | 2, degVal: number) => {
    if (!selectedBuilding) return
    const newRot = [...selectedBuilding.rotation] as [number, number, number]
    newRot[axis] = isNaN(degVal) ? 0 : (degVal * Math.PI) / 180
    onUpdateBuilding({ ...selectedBuilding, rotation: newRot })
  }

  const handleScaleChange = (axis: 0 | 1 | 2, val: number) => {
    if (!selectedBuilding) return
    const newScale = [...selectedBuilding.scale] as [number, number, number]
    newScale[axis] = isNaN(val) ? 0.001 : Math.max(0.0001, val)
    onUpdateBuilding({ ...selectedBuilding, scale: newScale })
  }

  const handleUniformScaleSet = (val: number) => {
    if (!selectedBuilding) return
    const safeVal = isNaN(val) ? 0.001 : Math.max(0.0001, val)
    onUpdateBuilding({
      ...selectedBuilding,
      scale: [safeVal, safeVal, safeVal],
    })
  }

  // Helpers for Waypoint inputs
  const handleWaypointCoordChange = (axis: 0 | 2, val: number) => {
    if (selectedWaypointIndex === null || !selectedWaypoint) return
    const updated = [...currentRoutePoints]
    const updatedPoint = [...selectedWaypoint] as [number, number, number]
    updatedPoint[axis] = isNaN(val) ? 0 : val
    updated[selectedWaypointIndex] = updatedPoint

    onChangeWaypoints({
      ...waypoints,
      [activeRouteId]: updated,
    })
  }

  const handleInsertWaypointAfter = () => {
    if (selectedWaypointIndex === null || !selectedWaypoint) return
    const updated = [...currentRoutePoints]
    const nextIdx = (selectedWaypointIndex + 1) % updated.length
    const nextPoint = updated[nextIdx]
    const midPoint: [number, number, number] = [
      Number(((selectedWaypoint[0] + nextPoint[0]) / 2).toFixed(2)),
      0.05,
      Number(((selectedWaypoint[2] + nextPoint[2]) / 2).toFixed(2)),
    ]

    updated.splice(selectedWaypointIndex + 1, 0, midPoint)
    onChangeWaypoints({
      ...waypoints,
      [activeRouteId]: updated,
    })
    onSelectWaypoint(selectedWaypointIndex + 1)
  }

  const handleDeleteWaypoint = () => {
    if (selectedWaypointIndex === null) return
    if (currentRoutePoints.length <= 3) {
      alert("A traffic loop needs at least 3 waypoints.")
      return
    }
    const updated = [...currentRoutePoints]
    updated.splice(selectedWaypointIndex, 1)
    onChangeWaypoints({
      ...waypoints,
      [activeRouteId]: updated,
    })
    onSelectWaypoint(null)
  }

  const interaction = selectedBuilding
    ? normalizeBuildingInteraction(selectedBuilding)
    : { type: "none" as BuildingModalType }

  return (
    <Card className="flex flex-col h-full bg-card/60 backdrop-blur-md border border-border p-4">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Inspector</h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase">
          {editorMode === "buildings" ? "Building Properties" : "Route & Waypoint Path"}
        </Badge>
      </div>

      {editorMode === "buildings" ? (
        /* Buildings Inspector */
        selectedBuilding ? (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Header / Name */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Building Name</Label>
              <Input
                value={selectedBuilding.name}
                onChange={(e) =>
                  onUpdateBuilding({ ...selectedBuilding, name: e.target.value })
                }
                className="h-8 text-xs font-medium"
              />
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className="text-[10px]">
                  Type: {selectedBuilding.type.toUpperCase()}
                </Badge>
                {(selectedBuilding.glb_url || selectedBuilding.model_url) && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-mono uppercase text-accent border-primary/30 bg-primary/10">
                    {selectedBuilding.model_format?.toUpperCase() ||
                      (selectedBuilding.model_url || selectedBuilding.glb_url || "")
                        .split("?")[0]
                        .split(".")
                        .pop()
                        ?.toUpperCase() || "MODEL"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Optional Billboard/Badge Label */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">3D Floating Badge Label</Label>
              <Input
                placeholder="e.g. PROJECTS, ABOUT, SOCIALS"
                value={selectedBuilding.label || ""}
                onChange={(e) =>
                  onUpdateBuilding({ ...selectedBuilding, label: e.target.value })
                }
                className="h-8 text-xs uppercase font-mono"
              />
            </div>

            <Separator />

            {/* Modal & Interaction Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Modal & Interaction
                </Label>
                {interaction.type !== "none" && onPreviewBuilding && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] gap-1 text-accent hover:text-[#E1C1AF] hover:bg-primary/10 cursor-pointer"
                    onClick={() => onPreviewBuilding(selectedBuilding)}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview Modal</span>
                  </Button>
                )}
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground block mb-1">Click Action / Modal Target</span>
                <Select
                  value={interaction.type}
                  onValueChange={(val: BuildingModalType) => {
                    onUpdateBuilding({
                      ...selectedBuilding,
                      interaction: {
                        ...interaction,
                        type: val,
                      },
                    })
                  }}
                >
                  <SelectTrigger className="h-8 text-xs bg-slate-900/70 border-border">
                    <SelectValue placeholder="Select Action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Non-Interactive)</SelectItem>
                    <SelectItem value="projects">Projects Section</SelectItem>
                    <SelectItem value="about">About Section</SelectItem>
                    <SelectItem value="experience">Experience Section</SelectItem>
                    <SelectItem value="skills">Skills Spire</SelectItem>
                    <SelectItem value="certifications">Certifications Section</SelectItem>
                    <SelectItem value="contact">Contact Section</SelectItem>
                    <SelectItem value="custom">Custom Content & URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom modal fields if type === 'custom' */}
              {interaction.type === "custom" && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 animate-in fade-in duration-150">
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Custom Modal Title</span>
                    <Input
                      placeholder={selectedBuilding.name}
                      value={interaction.customTitle || ""}
                      onChange={(e) => {
                        onUpdateBuilding({
                          ...selectedBuilding,
                          interaction: { ...interaction, customTitle: e.target.value },
                        })
                      }}
                      className="h-7 text-xs"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Custom Subtitle</span>
                    <Input
                      placeholder="e.g. Featured Technology Showcase"
                      value={interaction.customSubtitle || ""}
                      onChange={(e) => {
                        onUpdateBuilding({
                          ...selectedBuilding,
                          interaction: { ...interaction, customSubtitle: e.target.value },
                        })
                      }}
                      className="h-7 text-xs"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Markdown Content</span>
                    <textarea
                      placeholder="Describe this project, feature, or location... (Supports **bold**, *italic*, bullet lists)"
                      value={interaction.customContent || ""}
                      onChange={(e) => {
                        onUpdateBuilding({
                          ...selectedBuilding,
                          interaction: { ...interaction, customContent: e.target.value },
                        })
                      }}
                      rows={3}
                      className="w-full text-xs p-2 rounded-md bg-slate-950 border border-border text-slate-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Action Link URL</span>
                    <Input
                      placeholder="https://example.com or mailto:..."
                      value={interaction.customLink || ""}
                      onChange={(e) => {
                        onUpdateBuilding({
                          ...selectedBuilding,
                          interaction: { ...interaction, customLink: e.target.value },
                        })
                      }}
                      className="h-7 text-xs font-mono"
                    />
                    {interaction.customLink && !isValidSafeUrl(interaction.customLink) && (
                      <p className="text-[10px] text-amber-400 mt-0.5">
                        ⚠️ Only https:, http:, or mailto: links are allowed.
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Link Button Label</span>
                    <Input
                      placeholder="e.g. Open Live Demo"
                      value={interaction.customLinkLabel || ""}
                      onChange={(e) => {
                        onUpdateBuilding({
                          ...selectedBuilding,
                          interaction: { ...interaction, customLinkLabel: e.target.value },
                        })
                      }}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Position */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-red-400" />
                Position (X, Y, Z)
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">X</span>
                  <Input
                    type="number"
                    step="0.5"
                    value={selectedBuilding.position[0]}
                    onChange={(e) => handlePosChange(0, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Y</span>
                  <Input
                    type="number"
                    step="0.5"
                    value={selectedBuilding.position[1]}
                    onChange={(e) => handlePosChange(1, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Z</span>
                  <Input
                    type="number"
                    step="0.5"
                    value={selectedBuilding.position[2]}
                    onChange={(e) => handlePosChange(2, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2"
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 text-green-400" />
                Rotation (Degrees)
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">X°</span>
                  <Input
                    type="number"
                    step="15"
                    value={Math.round((selectedBuilding.rotation[0] * 180) / Math.PI)}
                    onChange={(e) => handleRotChange(0, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Y°</span>
                  <Input
                    type="number"
                    step="15"
                    value={Math.round((selectedBuilding.rotation[1] * 180) / Math.PI)}
                    onChange={(e) => handleRotChange(1, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Z°</span>
                  <Input
                    type="number"
                    step="15"
                    value={Math.round((selectedBuilding.rotation[2] * 180) / Math.PI)}
                    onChange={(e) => handleRotChange(2, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2"
                  />
                </div>
              </div>
            </div>

            {/* Scale */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Maximize2 className="w-3 h-3 text-blue-400" />
                  Scale
                </Label>
                {/* Quick scale presets for imported 3D models */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Set uniform scale to 0.001"
                    onClick={() => handleUniformScaleSet(0.001)}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors cursor-pointer"
                  >
                    0.001x
                  </button>
                  <button
                    type="button"
                    title="Set uniform scale to 0.01"
                    onClick={() => handleUniformScaleSet(0.01)}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors cursor-pointer"
                  >
                    0.01x
                  </button>
                  <button
                    type="button"
                    title="Set uniform scale to 0.1"
                    onClick={() => handleUniformScaleSet(0.1)}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors cursor-pointer"
                  >
                    0.1x
                  </button>
                  <button
                    type="button"
                    title="Set uniform scale to 1.0"
                    onClick={() => handleUniformScaleSet(1.0)}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors cursor-pointer"
                  >
                    1.0x
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Scale X</span>
                  <Input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={selectedBuilding.scale[0]}
                    onChange={(e) => handleScaleChange(0, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Scale Y</span>
                  <Input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={selectedBuilding.scale[1]}
                    onChange={(e) => handleScaleChange(1, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2 font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Scale Z</span>
                  <Input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={selectedBuilding.scale[2]}
                    onChange={(e) => handleScaleChange(2, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2 font-mono"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5 cursor-pointer"
                onClick={() => onDuplicateBuilding(selectedBuilding.id)}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs gap-1.5 cursor-pointer"
                onClick={() => onDeleteBuilding(selectedBuilding.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground space-y-3">
            <Building className="w-8 h-8 opacity-40" />
            <div>
              <p className="text-xs font-medium text-foreground">No Building Selected</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">
                Click any building in the 3D viewport or select one from the hierarchy list on the left to transform it or configure its modal.
              </p>
            </div>
          </div>
        )
      ) : (
        /* Waypoints & Route Inspector */
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Route Status Header */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <RouteIcon className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-semibold text-slate-200 uppercase font-mono">
                  {activeRouteId.replace("route-", "").replace(/-/g, " ")}
                </span>
              </div>
              <Badge
                variant={isRouteDisabled ? "destructive" : "secondary"}
                className="text-[10px]"
              >
                {isRouteDisabled ? "Path Disabled" : "Active Path"}
              </Badge>
            </div>

            {/* Disable / Enable Entire Route Button */}
            {onToggleRouteDisabled && (
              <Button
                variant={isRouteDisabled ? "default" : "outline"}
                size="sm"
                className={`w-full h-8 text-xs gap-1.5 justify-center font-medium cursor-pointer ${
                  isRouteDisabled
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                    : "border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                }`}
                onClick={() => onToggleRouteDisabled(activeRouteId)}
              >
                {isRouteDisabled ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Enable Entire Route Path</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>Disable Entire Route Path</span>
                  </>
                )}
              </Button>
            )}
          </div>

          <Separator />

          {/* Individual Waypoint Node Details (if selected) */}
          {selectedWaypoint ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Waypoint #{selectedWaypointIndex}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {currentRoutePoints.length} total points
                </span>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground block mb-1">X Coord</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={selectedWaypoint[0]}
                    onChange={(e) => handleWaypointCoordChange(0, parseFloat(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground block mb-1">Z Coord</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={selectedWaypoint[2]}
                    onChange={(e) => handleWaypointCoordChange(2, parseFloat(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Waypoint Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs gap-1 justify-center cursor-pointer"
                  onClick={handleInsertWaypointAfter}
                >
                  <PlusCircle className="w-3 h-3 text-emerald-400" />
                  <span>Insert Next</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs gap-1 justify-center px-2.5 cursor-pointer"
                  onClick={handleDeleteWaypoint}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center text-muted-foreground text-[11px] bg-slate-900/30 rounded border border-dashed border-slate-800">
              Click any node on this route to drag or edit its exact coordinates.
            </div>
          )}

          <Separator />

          {/* Reset Options */}
          <div className="space-y-1.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs gap-1.5 justify-center cursor-pointer"
              onClick={() => onResetRoute(activeRouteId)}
            >
              <RotateCcw className="w-3 h-3 text-accent" />
              <span>Reset This Route Path</span>
            </Button>

            {onResetAllRoutes && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs gap-1.5 justify-center text-amber-400 hover:text-amber-300 cursor-pointer"
                onClick={onResetAllRoutes}
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>Reset All Route Paths</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
