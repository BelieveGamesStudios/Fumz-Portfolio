"use client"

import React, { useMemo } from "react"
import * as THREE from "three"

// --- DIMENSIONS MATCHING REFERENCE IMAGE ---
const ROAD_WIDTH = 5.6
const HALF_ROAD = ROAD_WIDTH / 2
const SIDEWALK_WIDTH = 1.0
const ASPHALT_COLOR = "#242120"
const SIDEWALK_COLOR = "#c9b3a5"
const LINE_COLOR = "#eee2db"

// Roundabout
const ROUNDABOUT_INNER_RADIUS = 4.2
const ROUNDABOUT_OUTER_RADIUS = 9.2

// Perimeter Rectangle
const HALF_W = 36 // Left at -36, Right at +36
const HALF_D = 22 // Top at -22, Bottom at +22
const CORNER_R = 7.0 // Radius of corner curves

// Pristine arc geometry generator with explicit [0, 1, 0] upward normals
// (Eliminates zero-normal shading artifacts, moiré lines, and face-fighting)
function createRoadArcGeometry(
  cx: number,
  cz: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
  segments = 40
) {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const angle = startAngle + t * (endAngle - startAngle)
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    // Inner vertex
    positions.push(cx + innerR * cos, 0, cz + innerR * sin)
    normals.push(0, 1, 0)
    uvs.push(0, t)

    // Outer vertex
    positions.push(cx + outerR * cos, 0, cz + outerR * sin)
    normals.push(0, 1, 0)
    uvs.push(1, t)
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 2
    const b = a + 1
    const c = a + 2
    const d = a + 3

    indices.push(a, b, c)
    indices.push(b, d, c)
  }

  const geom = new THREE.BufferGeometry()
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
  geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3))
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2))
  geom.setIndex(indices)
  return geom
}

// Straight Road Segment
function StraightRoad({
  start,
  end,
  hasCenterLine = true,
  hasLeftSidewalk = true,
  hasRightSidewalk = true,
}: {
  start: [number, number]
  end: [number, number]
  hasCenterLine?: boolean
  hasLeftSidewalk?: boolean
  hasRightSidewalk?: boolean
}) {
  const dx = end[0] - start[0]
  const dz = end[1] - start[1]
  const length = Math.hypot(dx, dz)
  const angle = Math.atan2(dx, dz)
  const midX = (start[0] + end[0]) / 2
  const midZ = (start[1] + end[1]) / 2

  if (length <= 0.05) return null

  return (
    <group position={[midX, 0.02, midZ]} rotation={[0, angle, 0]}>
      {/* Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, length]} />
        <meshStandardMaterial
          color={ASPHALT_COLOR}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left Sidewalk */}
      {hasLeftSidewalk && (
        <mesh
          position={[-HALF_ROAD - SIDEWALK_WIDTH / 2, 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[SIDEWALK_WIDTH, length]} />
          <meshStandardMaterial
            color={SIDEWALK_COLOR}
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Right Sidewalk */}
      {hasRightSidewalk && (
        <mesh
          position={[HALF_ROAD + SIDEWALK_WIDTH / 2, 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[SIDEWALK_WIDTH, length]} />
          <meshStandardMaterial
            color={SIDEWALK_COLOR}
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Dashed Center Line */}
      {hasCenterLine && (
        <group position={[0, 0.01, 0]}>
          {Array.from({ length: Math.max(1, Math.floor(length / 3.4)) }).map(
            (_, i, arr) => {
              const step = length / arr.length
              const zPos = -length / 2 + step * (i + 0.5)
              return (
                <mesh key={i} position={[0, 0, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.24, 1.8]} />
                  <meshStandardMaterial
                    color={LINE_COLOR}
                    roughness={0.4}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )
            }
          )}
        </group>
      )}
    </group>
  )
}

// Zebra Crosswalk
function Crosswalk({
  position,
  rotation = 0,
}: {
  position: [number, number, number]
  rotation?: number
}) {
  const stripeCount = 7
  const stripeWidth = 0.45
  const stripeLength = 2.0
  const gap = 0.32
  const totalSpan = (stripeCount - 1) * (stripeWidth + gap)

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {Array.from({ length: stripeCount }).map((_, i) => {
        const xPos = -totalSpan / 2 + i * (stripeWidth + gap)
        return (
          <mesh key={i} position={[xPos, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[stripeWidth, stripeLength]} />
            <meshStandardMaterial
              color={LINE_COLOR}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Smooth, Clean Curved Corner (No dark lines or overlapping UV artifacts)
function CornerCurve({
  cx,
  cz,
  startAngle,
  endAngle,
}: {
  cx: number
  cz: number
  startAngle: number
  endAngle: number
}) {
  const asphaltGeom = useMemo(() => {
    return createRoadArcGeometry(
      cx,
      cz,
      CORNER_R - HALF_ROAD,
      CORNER_R + HALF_ROAD,
      startAngle,
      endAngle
    )
  }, [cx, cz, startAngle, endAngle])

  const innerSidewalkGeom = useMemo(() => {
    return createRoadArcGeometry(
      cx,
      cz,
      CORNER_R - HALF_ROAD - SIDEWALK_WIDTH,
      CORNER_R - HALF_ROAD,
      startAngle,
      endAngle
    )
  }, [cx, cz, startAngle, endAngle])

  const outerSidewalkGeom = useMemo(() => {
    return createRoadArcGeometry(
      cx,
      cz,
      CORNER_R + HALF_ROAD,
      CORNER_R + HALF_ROAD + SIDEWALK_WIDTH,
      startAngle,
      endAngle
    )
  }, [cx, cz, startAngle, endAngle])

  return (
    <group position={[0, 0.02, 0]}>
      {/* Smooth Asphalt Bend */}
      <mesh geometry={asphaltGeom} receiveShadow>
        <meshStandardMaterial
          color={ASPHALT_COLOR}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner Sidewalk */}
      <mesh geometry={innerSidewalkGeom} position={[0, 0.005, 0]} receiveShadow>
        <meshStandardMaterial
          color={SIDEWALK_COLOR}
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Outer Sidewalk */}
      <mesh geometry={outerSidewalkGeom} position={[0, 0.005, 0]} receiveShadow>
        <meshStandardMaterial
          color={SIDEWALK_COLOR}
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// 4-Way Intersection Box with 4 zebra crosswalks
function IntersectionBox({ position }: { position: [number, number] }) {
  const [x, z] = position
  return (
    <group position={[x, 0.02, z]}>
      {/* Center Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, ROAD_WIDTH]} />
        <meshStandardMaterial
          color={ASPHALT_COLOR}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Crosswalks on the 4 approaches */}
      <Crosswalk position={[0, 0.015, -HALF_ROAD - 1.2]} />
      <Crosswalk position={[0, 0.015, HALF_ROAD + 1.2]} />
      <Crosswalk position={[-HALF_ROAD - 1.2, 0.015, 0]} rotation={Math.PI / 2} />
      <Crosswalk position={[HALF_ROAD + 1.2, 0.015, 0]} rotation={Math.PI / 2} />
    </group>
  )
}

// Central Roundabout
function CentralRoundabout() {
  const halfA = 0.32

  const trSidewalk = useMemo(
    () =>
      createRoadArcGeometry(
        0,
        0,
        ROUNDABOUT_OUTER_RADIUS,
        ROUNDABOUT_OUTER_RADIUS + SIDEWALK_WIDTH,
        3 * Math.PI / 2 + halfA,
        2 * Math.PI - halfA
      ),
    []
  )
  const brSidewalk = useMemo(
    () =>
      createRoadArcGeometry(
        0,
        0,
        ROUNDABOUT_OUTER_RADIUS,
        ROUNDABOUT_OUTER_RADIUS + SIDEWALK_WIDTH,
        0 + halfA,
        Math.PI / 2 - halfA
      ),
    []
  )
  const blSidewalk = useMemo(
    () =>
      createRoadArcGeometry(
        0,
        0,
        ROUNDABOUT_OUTER_RADIUS,
        ROUNDABOUT_OUTER_RADIUS + SIDEWALK_WIDTH,
        Math.PI / 2 + halfA,
        Math.PI - halfA
      ),
    []
  )
  const tlSidewalk = useMemo(
    () =>
      createRoadArcGeometry(
        0,
        0,
        ROUNDABOUT_OUTER_RADIUS,
        ROUNDABOUT_OUTER_RADIUS + SIDEWALK_WIDTH,
        Math.PI + halfA,
        3 * Math.PI / 2 - halfA
      ),
    []
  )

  return (
    <group position={[0, 0.02, 0]}>
      {/* Asphalt Circle Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry
          args={[ROUNDABOUT_INNER_RADIUS, ROUNDABOUT_OUTER_RADIUS, 64]}
        />
        <meshStandardMaterial
          color={ASPHALT_COLOR}
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dashed Circular Lane Line */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.6, 6.82, 48]} />
        <meshStandardMaterial
          color={LINE_COLOR}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4 Quadrant Sidewalks around the Roundabout */}
      <mesh geometry={trSidewalk} position={[0, 0.005, 0]} receiveShadow>
        <meshStandardMaterial
          color={SIDEWALK_COLOR}
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={brSidewalk} position={[0, 0.005, 0]} receiveShadow>
        <meshStandardMaterial
          color={SIDEWALK_COLOR}
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={blSidewalk} position={[0, 0.005, 0]} receiveShadow>
        <meshStandardMaterial
          color={SIDEWALK_COLOR}
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={tlSidewalk} position={[0, 0.005, 0]} receiveShadow>
        <meshStandardMaterial
          color={SIDEWALK_COLOR}
          roughness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Central Island Greenery & Raised Curb */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[ROUNDABOUT_INNER_RADIUS, 48]} />
        <meshStandardMaterial
          color="#706b45"
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Island Stone Curb */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[ROUNDABOUT_INNER_RADIUS - 0.45, ROUNDABOUT_INNER_RADIUS, 48]}
        />
        <meshStandardMaterial
          color={SIDEWALK_COLOR}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Miniature Trees on Central Island */}
      <MiniTree position={[0, 0.06, 0]} scale={1.2} />
      <MiniTree position={[-1.4, 0.06, -0.8]} scale={0.85} />
      <MiniTree position={[1.3, 0.06, 0.9]} scale={0.95} />

      {/* 4 Crosswalks at Roundabout exits */}
      <Crosswalk position={[0, 0.015, -ROUNDABOUT_OUTER_RADIUS - 1.2]} />
      <Crosswalk position={[0, 0.015, ROUNDABOUT_OUTER_RADIUS + 1.2]} />
      <Crosswalk
        position={[-ROUNDABOUT_OUTER_RADIUS - 1.2, 0.015, 0]}
        rotation={Math.PI / 2}
      />
      <Crosswalk
        position={[ROUNDABOUT_OUTER_RADIUS + 1.2, 0.015, 0]}
        rotation={Math.PI / 2}
      />
    </group>
  )
}

function MiniTree({
  position,
  scale = 1,
}: {
  position: [number, number, number]
  scale?: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1, 8]} />
        <meshStandardMaterial color="#5a3828" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.7, 8, 8]} />
        <meshStandardMaterial color="#77734b" roughness={0.8} flatShading />
      </mesh>
    </group>
  )
}

export function Roads() {
  const cxL = -HALF_W + CORNER_R // -29.0
  const cxR = HALF_W - CORNER_R  //  29.0
  const czT = -HALF_D + CORNER_R // -15.0
  const czB = HALF_D - CORNER_R  //  15.0

  return (
    <group name="BelieveRoadNetwork">
      {/* 1. CENTRAL ROUNDABOUT */}
      <CentralRoundabout />

      {/* 2. INNER SPOKES */}
      <StraightRoad
        start={[0, -ROUNDABOUT_OUTER_RADIUS]}
        end={[0, -HALF_D + HALF_ROAD]}
      />
      <StraightRoad
        start={[0, ROUNDABOUT_OUTER_RADIUS]}
        end={[0, HALF_D - HALF_ROAD]}
      />
      <StraightRoad
        start={[-ROUNDABOUT_OUTER_RADIUS, 0]}
        end={[-HALF_W + HALF_ROAD, 0]}
      />
      <StraightRoad
        start={[ROUNDABOUT_OUTER_RADIUS, 0]}
        end={[HALF_W - HALF_ROAD, 0]}
      />

      {/* 3. FOUR OUTER INTERSECTIONS */}
      <IntersectionBox position={[0, -HALF_D]} />
      <IntersectionBox position={[0, HALF_D]} />
      <IntersectionBox position={[-HALF_W, 0]} />
      <IntersectionBox position={[HALF_W, 0]} />

      {/* 4. PERIMETER STRAIGHT SECTIONS */}
      <StraightRoad start={[cxL, -HALF_D]} end={[-HALF_ROAD, -HALF_D]} />
      <StraightRoad start={[HALF_ROAD, -HALF_D]} end={[cxR, -HALF_D]} />

      <StraightRoad start={[cxL, HALF_D]} end={[-HALF_ROAD, HALF_D]} />
      <StraightRoad start={[HALF_ROAD, HALF_D]} end={[cxR, HALF_D]} />

      <StraightRoad start={[-HALF_W, czT]} end={[-HALF_W, -HALF_ROAD]} />
      <StraightRoad start={[-HALF_W, HALF_ROAD]} end={[-HALF_W, czB]} />

      <StraightRoad start={[HALF_W, czT]} end={[HALF_W, -HALF_ROAD]} />
      <StraightRoad start={[HALF_W, HALF_ROAD]} end={[HALF_W, czB]} />

      {/* 5. FOUR OUTER CORNERS — CLEAN, SMOOTH, ARTIFACT-FREE */}
      <CornerCurve
        cx={cxL}
        cz={czT}
        startAngle={Math.PI}
        endAngle={(3 * Math.PI) / 2}
      />
      <CornerCurve
        cx={cxR}
        cz={czT}
        startAngle={(3 * Math.PI) / 2}
        endAngle={2 * Math.PI}
      />
      <CornerCurve
        cx={cxR}
        cz={czB}
        startAngle={0}
        endAngle={Math.PI / 2}
      />
      <CornerCurve
        cx={cxL}
        cz={czB}
        startAngle={Math.PI / 2}
        endAngle={Math.PI}
      />

      {/* 6. FOUR EXTERIOR STUB ROADS */}
      <StraightRoad start={[0, -HALF_D - HALF_ROAD]} end={[0, -31]} />
      <StraightRoad start={[0, HALF_D + HALF_ROAD]} end={[0, 31]} />
      <StraightRoad start={[-HALF_W - HALF_ROAD, 0]} end={[-45, 0]} />
      <StraightRoad start={[HALF_W + HALF_ROAD, 0]} end={[45, 0]} />
    </group>
  )
}
