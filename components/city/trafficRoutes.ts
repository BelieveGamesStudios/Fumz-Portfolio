import * as THREE from "three"

// ============================================================================
// MATHEMATICALLY EXACT TRAFFIC LANES CONFIGURATION
// All routes use uniformly spaced waypoints so Catmull-Rom splines never bulge
// or cut into grass.
// ============================================================================

export const ROAD_WIDTH = 5.6
export const LANE_OFFSET = 1.4 // Distance from center line to lane center
export const R_ROUNDABOUT = 6.8 // Mid-radius of the roundabout circular lane

// Corner arc center coordinates:
const cxL = -29.0
const cxR = 29.0
const czT = -15.0
const czB = 15.0

// Radii of the inner and outer lanes around the 4 corners:
const R_INNER = 7.0 - LANE_OFFSET // 5.6
const R_OUTER = 7.0 + LANE_OFFSET // 8.4

// Helper: Uniformly sample points along a circular arc
function sampleArc(
  cx: number,
  cz: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  stepDistance = 2.4
): THREE.Vector3[] {
  const arcLength = Math.abs(endAngle - startAngle) * radius
  const steps = Math.max(3, Math.ceil(arcLength / stepDistance))
  const pts: THREE.Vector3[] = []

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const angle = startAngle + t * (endAngle - startAngle)
    pts.push(
      new THREE.Vector3(
        cx + radius * Math.cos(angle),
        0.05,
        cz + radius * Math.sin(angle)
      )
    )
  }
  return pts
}

// Helper: Uniformly sample points along a straight line segment
function sampleLine(
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  stepDistance = 3.0
): THREE.Vector3[] {
  const dist = Math.hypot(x2 - x1, z2 - z1)
  const steps = Math.max(1, Math.ceil(dist / stepDistance))
  const pts: THREE.Vector3[] = []

  for (let i = 0; i < steps; i++) {
    const t = i / steps
    pts.push(
      new THREE.Vector3(
        x1 + t * (x2 - x1),
        0.05,
        z1 + t * (z2 - z1)
      )
    )
  }
  return pts
}

export interface RouteDefinition {
  id: string
  name: string
  color: string
  points: THREE.Vector3[]
  curve: THREE.CatmullRomCurve3
}

export function getDefaultRouteWaypoints(): Record<string, [number, number, number][]> {
  const routes = generateTrafficRoutes()
  const map: Record<string, [number, number, number][]> = {}
  for (const r of routes) {
    map[r.id] = r.points.map((p) => [Number(p.x.toFixed(2)), Number(p.y.toFixed(2)), Number(p.z.toFixed(2))])
  }
  return map
}

export function generateTrafficRoutes(
  overrides?: Record<string, [number, number, number][]>
): RouteDefinition[] {
  const routes: RouteDefinition[] = []

  // ==========================================================================
  // ROUTE 0: CLOCKWISE OUTER PERIMETER (Inner Lane)
  // Color: Lime Green (#22c55e)
  // Follows: Top East -> TR Corner -> Right South -> BR Corner ->
  //          Bottom West -> BL Corner -> Left North -> TL Corner
  // ==========================================================================
  const r0_pts: THREE.Vector3[] = [
    // Top Edge (z = -20.6)
    ...sampleLine(-29, -20.6, 29, -20.6),
    // Top-Right Corner (from 3*PI/2 to 2*PI around cxR, czT)
    ...sampleArc(cxR, czT, R_INNER, (3 * Math.PI) / 2, 2 * Math.PI),
    // Right Edge (x = 34.6)
    ...sampleLine(34.6, -15, 34.6, 15),
    // Bottom-Right Corner (from 0 to PI/2 around cxR, czB)
    ...sampleArc(cxR, czB, R_INNER, 0, Math.PI / 2),
    // Bottom Edge (z = 20.6)
    ...sampleLine(29, 20.6, -29, 20.6),
    // Bottom-Left Corner (from PI/2 to PI around cxL, czB)
    ...sampleArc(cxL, czB, R_INNER, Math.PI / 2, Math.PI),
    // Left Edge (x = -34.6)
    ...sampleLine(-34.6, 15, -34.6, -15),
    // Top-Left Corner (from PI to 3*PI/2 around cxL, czT)
    ...sampleArc(cxL, czT, R_INNER, Math.PI, (3 * Math.PI) / 2),
  ]

  function getRoutePoints(id: string, defaultPts: THREE.Vector3[]): THREE.Vector3[] {
    const custom = overrides?.[id]
    if (custom && custom.length >= 3) {
      return custom.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
    }
    return defaultPts
  }

  const p0 = getRoutePoints("route-clockwise-outer", r0_pts)
  routes.push({
    id: "route-clockwise-outer",
    name: "Outer Clockwise (Inner Lane)",
    color: "#22c55e",
    points: p0,
    curve: new THREE.CatmullRomCurve3(p0, true, "centripetal", 0.0),
  })

  // ==========================================================================
  // ROUTE 1: COUNTER-CLOCKWISE OUTER PERIMETER (Outer Lane)
  // Color: Cyan (#06b6d4)
  // Follows: Top West -> TL Corner -> Left South -> BL Corner ->
  //          Bottom East -> BR Corner -> Right North -> TR Corner
  // ==========================================================================
  const r1_pts: THREE.Vector3[] = [
    // Top Edge (z = -23.4)
    ...sampleLine(29, -23.4, -29, -23.4),
    // Top-Left Corner (from 3*PI/2 to PI around cxL, czT)
    ...sampleArc(cxL, czT, R_OUTER, (3 * Math.PI) / 2, Math.PI),
    // Left Edge (x = -37.4)
    ...sampleLine(-37.4, -15, -37.4, 15),
    // Bottom-Left Corner (from PI to PI/2 around cxL, czB)
    ...sampleArc(cxL, czB, R_OUTER, Math.PI, Math.PI / 2),
    // Bottom Edge (z = 23.4)
    ...sampleLine(-29, 23.4, 29, 23.4),
    // Bottom-Right Corner (from PI/2 to 0 around cxR, czB)
    ...sampleArc(cxR, czB, R_OUTER, Math.PI / 2, 0),
    // Right Edge (x = 37.4)
    ...sampleLine(37.4, 15, 37.4, -15),
    // Top-Right Corner (from 2*PI to 3*PI/2 around cxR, czT)
    ...sampleArc(cxR, czT, R_OUTER, 2 * Math.PI, (3 * Math.PI) / 2),
  ]

  const p1 = getRoutePoints("route-counter-clockwise-outer", r1_pts)
  routes.push({
    id: "route-counter-clockwise-outer",
    name: "Outer Counter-Clockwise (Outer Lane)",
    color: "#06b6d4",
    points: p1,
    curve: new THREE.CatmullRomCurve3(p1, true, "centripetal", 0.0),
  })

  // ==========================================================================
  // ROUTE 2: NORTH-SOUTH TWO-WAY THOROUGHFARE
  // Color: Amber (#f59e0b)
  // Drives South in right lane (x = 1.4), enters Roundabout, circles West side,
  // exits South spoke in right lane (x = 1.4), loops at South stub, drives
  // North in right lane (x = -1.4), circles East side of Roundabout, loops North.
  // ==========================================================================
  const r2_pts: THREE.Vector3[] = [
    // Southbound: down North spoke (x = 1.4)
    ...sampleLine(LANE_OFFSET, -30, LANE_OFFSET, -9.0),
    // Entering Roundabout: counter-clockwise west arc (from 3*PI/2 through PI to PI/2)
    ...sampleArc(0, 0, R_ROUNDABOUT, (3 * Math.PI) / 2, Math.PI / 2),
    // Exiting South spoke Southbound (x = 1.4)
    ...sampleLine(LANE_OFFSET, 9.0, LANE_OFFSET, 30),
    // Smooth U-turn at South Stub from x = 1.4 to x = -1.4
    ...sampleArc(0, 30, LANE_OFFSET, 0, Math.PI),
    // Northbound: up South spoke (x = -1.4)
    ...sampleLine(-LANE_OFFSET, 30, -LANE_OFFSET, 9.0),
    // Entering Roundabout: counter-clockwise east arc (from PI/2 through 0 to -PI/2)
    ...sampleArc(0, 0, R_ROUNDABOUT, Math.PI / 2, -Math.PI / 2),
    // Exiting North spoke Northbound (x = -1.4)
    ...sampleLine(-LANE_OFFSET, -9.0, -LANE_OFFSET, -30),
    // Smooth U-turn at North Stub from x = -1.4 to x = 1.4
    ...sampleArc(0, -30, LANE_OFFSET, Math.PI, 0),
  ]

  const p2 = getRoutePoints("route-north-south-artery", r2_pts)
  routes.push({
    id: "route-north-south-artery",
    name: "North-South Boulevard (Two-Way)",
    color: "#f59e0b",
    points: p2,
    curve: new THREE.CatmullRomCurve3(p2, true, "centripetal", 0.0),
  })

  // ==========================================================================
  // ROUTE 3: EAST-WEST TWO-WAY THOROUGHFARE
  // Color: Pink (#ec4899)
  // Drives East in right lane (z = 1.4), enters Roundabout, circles South side,
  // exits East spoke in right lane (z = 1.4), loops at East stub, drives
  // West in right lane (z = -1.4), circles North side of Roundabout, loops West.
  // ==========================================================================
  const r3_pts: THREE.Vector3[] = [
    // Eastbound: along West spoke (z = 1.4)
    ...sampleLine(-42, LANE_OFFSET, -9.0, LANE_OFFSET),
    // Roundabout South arc: from PI through PI/2 to 0
    ...sampleArc(0, 0, R_ROUNDABOUT, Math.PI, 0),
    // Eastbound: along East spoke (z = 1.4)
    ...sampleLine(9.0, LANE_OFFSET, 42, LANE_OFFSET),
    // Smooth U-turn at East Stub from z = 1.4 to z = -1.4
    ...sampleArc(42, 0, LANE_OFFSET, Math.PI / 2, -Math.PI / 2),
    // Westbound: along East spoke (z = -1.4)
    ...sampleLine(42, -LANE_OFFSET, 9.0, -LANE_OFFSET),
    // Roundabout North arc: from 0 through -PI/2 to -PI
    ...sampleArc(0, 0, R_ROUNDABOUT, 0, -Math.PI),
    // Westbound: along West spoke (z = -1.4)
    ...sampleLine(-9.0, -LANE_OFFSET, -42, -LANE_OFFSET),
    // Smooth U-turn at West Stub from z = -1.4 to z = 1.4
    ...sampleArc(-42, 0, LANE_OFFSET, (3 * Math.PI) / 2, Math.PI / 2),
  ]

  const p3 = getRoutePoints("route-east-west-artery", r3_pts)
  routes.push({
    id: "route-east-west-artery",
    name: "East-West Boulevard (Two-Way)",
    color: "#ec4899",
    points: p3,
    curve: new THREE.CatmullRomCurve3(p3, true, "centripetal", 0.0),
  })

  // ==========================================================================
  // ROUTE 4: CENTRAL ROUNDABOUT CIRCULATION LOOP
  // Color: Gold / Yellow (#eab308)
  // A continuous smooth circular orbit around the central roundabout island!
  // ==========================================================================
  const r4_pts: THREE.Vector3[] = [
    ...sampleArc(0, 0, R_ROUNDABOUT, 0, 2 * Math.PI, 2.0),
  ]

  const p4 = getRoutePoints("route-roundabout-loop", r4_pts)
  routes.push({
    id: "route-roundabout-loop",
    name: "Central Roundabout Cruise",
    color: "#eab308",
    points: p4,
    curve: new THREE.CatmullRomCurve3(p4, true, "centripetal", 0.0),
  })

  return routes
}
