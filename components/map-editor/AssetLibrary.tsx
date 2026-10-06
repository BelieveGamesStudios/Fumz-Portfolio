"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Upload,
  Plus,
  Trash2,
  Box,
  Building2,
  Layers,
  Sparkles,
  FileCheck,
  Search,
} from "lucide-react"
import { MapAsset, PlacedBuilding } from "./types"
import { uploadGlbAsset } from "@/lib/supabase/mapEditor"

interface AssetLibraryProps {
  assets: MapAsset[]
  onAssetUploaded: (asset: MapAsset) => void
  onDeleteAsset: (id: string) => void
  onAddBuilding: (building: PlacedBuilding) => void
  placedBuildings: PlacedBuilding[]
  selectedBuildingId: string | null
  onSelectBuilding: (id: string | null) => void
  onDeleteBuilding: (id: string) => void
}

export function AssetLibrary({
  assets,
  onAssetUploaded,
  onDeleteAsset,
  onAddBuilding,
  placedBuildings,
  selectedBuildingId,
  onSelectBuilding,
  onDeleteBuilding,
}: AssetLibraryProps) {
  const [activeTab, setActiveTab] = useState<"library" | "hierarchy">("library")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const res = await uploadGlbAsset(file)
      if (res.success && res.asset) {
        onAssetUploaded(res.asset)
      } else {
        setUploadError(res.error || "Upload failed")
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload error")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSpawnGlb = (asset: MapAsset) => {
    const newBuilding: PlacedBuilding = {
      id: `glb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: asset.name,
      type: "glb",
      glb_url: asset.file_url,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    }
    onAddBuilding(newBuilding)
  }

  const handleSpawnPreset = (type: "portfolio" | "decorative", name: string, color: string, scale: [number, number, number]) => {
    const newBuilding: PlacedBuilding = {
      id: `preset-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      type,
      label: name.toUpperCase(),
      color,
      position: [Math.floor(Math.random() * 20) - 10, 0, Math.floor(Math.random() * 20) - 10],
      rotation: [0, 0, 0],
      scale,
    }
    onAddBuilding(newBuilding)
  }

  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <Card className="flex flex-col h-full bg-card/60 backdrop-blur-md border border-border p-4">
      {/* Top Nav between Library and Scene Hierarchy */}
      <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg mb-3">
        <button
          onClick={() => setActiveTab("library")}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "library"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Assets & Models</span>
        </button>

        <button
          onClick={() => setActiveTab("hierarchy")}
          className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "hierarchy"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Hierarchy ({placedBuildings.length})</span>
        </button>
      </div>

      {activeTab === "library" ? (
        <div className="flex flex-col flex-1 min-h-0 space-y-4">
          {/* Upload .glb Button */}
          <div className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-xl p-4 text-center bg-muted/20">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".glb,.gltf"
              className="hidden"
            />
            <Upload className="w-6 h-6 mx-auto mb-1.5 text-muted-foreground" />
            <p className="text-xs font-medium mb-1">Import 3D Building (.glb)</p>
            <p className="text-[11px] text-muted-foreground mb-3">
              Uploads to Supabase Storage
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-8 text-xs w-full"
            >
              {isUploading ? "Uploading..." : "Select .glb File"}
            </Button>

            {uploadError && (
              <p className="text-[11px] text-destructive mt-2">{uploadError}</p>
            )}
          </div>

          {/* Quick Presets */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Presets
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs justify-start px-2 bg-muted/40 hover:bg-muted"
                onClick={() =>
                  handleSpawnPreset("portfolio", "Custom Portfolio Tower", "#38bdf8", [6, 14, 6])
                }
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] mr-1.5 flex-shrink-0" />
                <span className="truncate">Portfolio Tower</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs justify-start px-2 bg-muted/40 hover:bg-muted"
                onClick={() =>
                  handleSpawnPreset("decorative", "Skyline Skyscraper", "#64748b", [5, 20, 5])
                }
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#64748b] mr-1.5 flex-shrink-0" />
                <span className="truncate">Skyscraper</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs justify-start px-2 bg-muted/40 hover:bg-muted"
                onClick={() =>
                  handleSpawnPreset("decorative", "Commercial Block", "#475569", [8, 8, 8])
                }
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#475569] mr-1.5 flex-shrink-0" />
                <span className="truncate">Low Block</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs justify-start px-2 bg-muted/40 hover:bg-muted"
                onClick={() =>
                  handleSpawnPreset("portfolio", "Lab Pavilion", "#ec4899", [7, 6, 7])
                }
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#ec4899] mr-1.5 flex-shrink-0" />
                <span className="truncate">Pavilion</span>
              </Button>
            </div>
          </div>

          {/* Uploaded GLB Models List */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-cyan-400" />
                Uploaded GLB Models ({assets.length})
              </h4>
            </div>

            {assets.length > 3 && (
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Filter models..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            )}

            <ScrollArea className="flex-1 pr-1.5">
              {filteredAssets.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  {assets.length === 0
                    ? "No custom .glb models uploaded yet. Upload one above!"
                    : "No matching models."}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-2.5 rounded-lg border border-border/80 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{asset.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {asset.file_size
                            ? `${(asset.file_size / (1024 * 1024)).toFixed(1)} MB`
                            : "GLB Model"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 text-xs px-2 gap-1"
                          onClick={() => handleSpawnGlb(asset)}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onDeleteAsset(asset.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      ) : (
        /* Scene Hierarchy Tab */
        <div className="flex-1 min-h-0 flex flex-col">
          <ScrollArea className="flex-1 pr-1.5">
            <div className="space-y-1.5">
              {placedBuildings.map((b) => {
                const isSelected = selectedBuildingId === b.id
                return (
                  <div
                    key={b.id}
                    onClick={() => onSelectBuilding(b.id)}
                    className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary font-medium"
                        : "bg-background/40 border-border/60 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            b.color || (b.type === "glb" ? "#06b6d4" : "#64748b"),
                        }}
                      />
                      <span className="truncate">{b.name}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                        {b.type.toUpperCase()}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteBuilding(b.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </Card>
  )
}
