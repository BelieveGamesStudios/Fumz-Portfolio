"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  CheckCircle2,
} from "lucide-react"
import { PlacedBuilding, RouteWaypointMap } from "./types"

interface InspectorProps {
  editorMode: "buildings" | "waypoints"
  // Buildings inspection
  buildings: PlacedBuilding[]
  selectedBuildingId: string | null
  onUpdateBuilding: (updated: PlacedBuilding) => void
  onDuplicateBuilding: (id: string) => void
  onDeleteBuilding: (id: string) => void
  // Waypoint inspection
  waypoints: RouteWaypointMap
  activeRouteId: string
  selectedWaypointIndex: number | null
  onChangeWaypoints: (updated: RouteWaypointMap) => void
  onSelectWaypoint: (idx: number | null) => void
  onResetRoute: (routeId: string) => void
}

export function Inspector({
  editorMode,
  buildings,
  selectedBuildingId,
  onUpdateBuilding,
  onDuplicateBuilding,
  onDeleteBuilding,
  waypoints,
  activeRouteId,
  selectedWaypointIndex,
  onChangeWaypoints,
  onSelectWaypoint,
  onResetRoute,
}: InspectorProps) {
  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId)
  const currentRoutePoints = waypoints[activeRouteId] || []
  const selectedWaypoint =
    selectedWaypointIndex !== null && currentRoutePoints[selectedWaypointIndex]
      ? currentRoutePoints[selectedWaypointIndex]
      : null

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
    newScale[axis] = Math.max(0.1, isNaN(val) ? 1 : val)
    onUpdateBuilding({ ...selectedBuilding, scale: newScale })
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
    // Interpolate midpoint with next point or offset slightly
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

  return (
    <Card className="flex flex-col h-full bg-card/60 backdrop-blur-md border border-border p-4">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Inspector</h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase">
          {editorMode === "buildings" ? "Building Properties" : "Waypoint Properties"}
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
                {selectedBuilding.glb_url && (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                    Custom GLB
                  </span>
                )}
              </div>
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
              <Label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Maximize2 className="w-3 h-3 text-blue-400" />
                Scale
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Scale X</span>
                  <Input
                    type="number"
                    step="0.2"
                    value={selectedBuilding.scale[0]}
                    onChange={(e) => handleScaleChange(0, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Scale Y</span>
                  <Input
                    type="number"
                    step="0.2"
                    value={selectedBuilding.scale[1]}
                    onChange={(e) => handleScaleChange(1, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Scale Z</span>
                  <Input
                    type="number"
                    step="0.2"
                    value={selectedBuilding.scale[2]}
                    onChange={(e) => handleScaleChange(2, parseFloat(e.target.value))}
                    className="h-7 text-xs px-2"
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
                className="flex-1 h-8 text-xs gap-1.5"
                onClick={() => onDuplicateBuilding(selectedBuilding.id)}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs gap-1.5"
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
                Click any building in the 3D viewport or select one from the hierarchy list on the left to transform it.
              </p>
            </div>
          </div>
        )
      ) : (
        /* Waypoints Inspector */
        selectedWaypoint ? (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold">Waypoint #{selectedWaypointIndex}</span>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {currentRoutePoints.length} total points
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Drag the waypoint in the 3D viewport or fine-tune coordinates below.
              </p>
            </div>

            <Separator />

            {/* Coordinates */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground block mb-1">X Coordinate</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={selectedWaypoint[0]}
                  onChange={(e) => handleWaypointCoordChange(0, parseFloat(e.target.value))}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground block mb-1">Z Coordinate</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={selectedWaypoint[2]}
                  onChange={(e) => handleWaypointCoordChange(2, parseFloat(e.target.value))}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <Separator />

            {/* Waypoint Actions */}
            <div className="space-y-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5 justify-center"
                onClick={handleInsertWaypointAfter}
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Insert Waypoint After</span>
              </Button>

              <Button
                variant="destructive"
                size="sm"
                className="w-full h-8 text-xs gap-1.5 justify-center"
                onClick={handleDeleteWaypoint}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Waypoint</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs gap-1.5 justify-center text-muted-foreground hover:text-foreground"
                onClick={() => onResetRoute(activeRouteId)}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Route to Default</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground space-y-3">
            <MapPin className="w-8 h-8 opacity-40 text-amber-400" />
            <div>
              <p className="text-xs font-medium text-foreground">No Waypoint Selected</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">
                Click any colored waypoint sphere on the active route line to drag or edit its exact path coordinates.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 gap-1"
              onClick={() => onResetRoute(activeRouteId)}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Active Route</span>
            </Button>
          </div>
        )
      )}
    </Card>
  )
}
