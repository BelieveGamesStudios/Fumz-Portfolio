"use client"

export function CityEnvironment() {
  return (
    <>
      {/* Soft warm sun lighting matching low-poly diorama */}
      <ambientLight intensity={0.9} color="#f3e6dc" />
      <directionalLight
        position={[35, 60, 30]}
        intensity={1.3}
        color="#f4c8aa"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />

      {/* Sky & ground bounce */}
      <hemisphereLight args={["#c8a895", "#4d3328", 0.48]} />

      {/* Raised Diorama Platform (Top Grass + Brown Soil Edge like in the reference) */}
      <group position={[0, -0.9, 0]}>
        {/* Diorama Ground Slab (Height: 1.8) */}
        <mesh receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[90, 1.8, 68]} />
          <meshStandardMaterial color="#8d725d" roughness={0.86} />
        </mesh>

        {/* Brown Earth Edge on Bottom Sides */}
        <mesh position={[0, -0.85, 0]}>
          <boxGeometry args={[90.1, 0.3, 68.1]} />
          <meshStandardMaterial color="#4d2f22" roughness={0.92} />
        </mesh>
      </group>
    </>
  )
}
